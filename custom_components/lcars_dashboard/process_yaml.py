import logging
import yaml
import os
import json
import io
import re
from collections import OrderedDict
import jinja2
from jinja2.sandbox import SandboxedEnvironment

from annotatedyaml import loader
from annotatedyaml.loader import Secrets

from homeassistant.exceptions import HomeAssistantError
from homeassistant.core import HomeAssistant

from .const import DOMAIN, VERSION

_LOGGER = logging.getLogger(__name__)

def fromjson(value):
    return json.loads(value)

# Lazy-initialized Jinja2 environment scoped to HA config directory (not filesystem root)
_jinja_env = None
_jinja_base_dir = None

def _get_jinja_env(config_dir=None):
    """Get or create the sandboxed Jinja2 environment, scoped to config_dir.

    Raises HomeAssistantError when invoked before init_jinja_env() has been called
    with a real config directory (5X-B41 / #128). Previously this silently fell back
    to "/" which exposed the entire host filesystem to the Jinja FileSystemLoader.
    """
    global _jinja_env, _jinja_base_dir
    if _jinja_env is None or (config_dir and config_dir != _jinja_base_dir):
        base = config_dir or _jinja_base_dir
        if not base:
            raise HomeAssistantError(
                "LCARS Jinja environment not initialized; refusing to default to filesystem root"
            )
        _jinja_base_dir = base
        _jinja_env = SandboxedEnvironment(loader=jinja2.FileSystemLoader(base))
        _jinja_env.filters['fromjson'] = fromjson
    return _jinja_env

def init_jinja_env(config_dir):
    """Initialize the Jinja2 environment with the HA config directory."""
    _get_jinja_env(config_dir)

lcars_dashboard_more_pages = {}
llgen_config = {}

# WORF-SEC-006: Subdirectory name validation for more_pages
_SAFE_DIRNAME_RE = re.compile(r'^[a-zA-Z0-9_\-]+$')

def _is_safe_dirname(name):
    """Reject directory names with traversal or special characters."""
    return bool(name) and '..' not in name and _SAFE_DIRNAME_RE.match(name)


async def _read_yaml_safe(hass, full_path):
    """Read a YAML file safely in the executor with proper handle management."""
    def _read():
        if not os.path.exists(full_path):
            return None
        with open(full_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)
    return await hass.async_add_executor_job(_read)


async def _write_yaml_safe(hass, full_path, data):
    """Write a YAML file safely in the executor with proper handle management."""
    def _write():
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, "w", encoding="utf-8") as f:
            yaml.safe_dump(data, f, default_flow_style=False)
    await hass.async_add_executor_job(_write)

def _is_our_file(fname):
    """Check if a file belongs to LCARS Dashboard (skip noisy logging for other HA YAML)."""
    s = os.fspath(fname) if hasattr(os, "fspath") else str(fname)
    return 'lcars_dashboard' in s or 'lcars-dashboard' in s


def _compose_node_allow_undefined_kind(self, parent, index):
    """Composer that tolerates compose_*_node returning None for unknown event kinds.

    Equivalent to yaml.composer.Composer.compose_node but does not raise when
    the next event is not a Scalar/Sequence/Mapping start (some LCARS templates
    emit synthesized event streams with edge cases). Confined to our private
    loader subclass below so we never patch the global yaml.composer.Composer
    (5X-B42 / #127 — original code monkey-patched the library for every other
    HA integration in the process).
    """
    if self.check_event(yaml.events.AliasEvent):
        event = self.get_event()
        anchor = event.anchor
        if anchor not in self.anchors:
            raise yaml.composer.ComposerError(
                None, None, "found undefined alias %r" % anchor, event.start_mark
            )
        return self.anchors[anchor]
    event = self.peek_event()
    anchor = event.anchor
    self.descend_resolver(parent, index)
    node = None
    if self.check_event(yaml.events.ScalarEvent):
        node = self.compose_scalar_node(anchor)
    elif self.check_event(yaml.events.SequenceStartEvent):
        node = self.compose_sequence_node(anchor)
    elif self.check_event(yaml.events.MappingStartEvent):
        node = self.compose_mapping_node(anchor)
    self.ascend_resolver()
    return node


class LcarsPythonSafeLoader(loader.PythonSafeLoader):
    """Private PythonSafeLoader subclass for LCARS YAML processing.

    Carries the LCARS !include constructor and the tolerant compose_node
    override. Scoped so neither the global yaml library nor annotatedyaml's
    PythonSafeLoader are mutated (5X-B42, 5X-B43 / #127, #135).
    """
    compose_node = _compose_node_allow_undefined_kind


def _lcars_loader_factory(stream, secrets):
    return LcarsPythonSafeLoader(stream, secrets)


def load_yamll(fname, secrets=None, args={}):
    try:
        process_yaml = False
        with open(fname, encoding="utf-8") as f:
            if f.readline().lower().startswith(("# lcars_dashboard", "# lcars_theme", "# lovelace_gen", "#lcars_dashboard")):
                process_yaml = True

        ours = _is_our_file(fname)
        if ours:
            _LOGGER.debug("load_yamll: %s (jinja=%s)", fname, process_yaml)

        if process_yaml:
            _LOGGER.debug("Rendering Jinja2 template: %s (args=%s)", fname, list(args.keys()) if args else [])
            jinja = _get_jinja_env()
            # Convert absolute path to relative for the scoped loader
            tpl_name = fname
            if _jinja_base_dir and os.path.isabs(fname):
                tpl_name = os.path.relpath(fname, _jinja_base_dir)
            rendered = jinja.get_template(tpl_name).render({
                **args,
                "_dd_more_pages": lcars_dashboard_more_pages,
                "_global": llgen_config
                })
            _LOGGER.debug("Jinja2 rendered %d chars for %s", len(rendered), fname)
            stream = io.StringIO(rendered)
            stream.name = fname
            data = loader.yaml.load(stream, Loader=lambda _stream: _lcars_loader_factory(_stream, secrets)) or OrderedDict()
            _LOGGER.debug("Parsed YAML from Jinja2: %s → %s (%d items)", fname, type(data).__name__, len(data) if isinstance(data, (dict, list)) else 0)
            return data
        else:
            with open(fname, encoding="utf-8") as config_file:
                data = loader.yaml.load(config_file, Loader=lambda stream: _lcars_loader_factory(stream, secrets)) or OrderedDict()
                if ours:
                    _LOGGER.debug("Parsed YAML: %s → %s (%d items)", fname, type(data).__name__, len(data) if isinstance(data, (dict, list)) else 0)
                return data

    except loader.yaml.YAMLError as exc:
        _LOGGER.error("YAML parse error in %s: %s", fname, exc)
        raise HomeAssistantError(exc)
    except UnicodeDecodeError as exc:
        _LOGGER.error("Unicode decode error in %s: %s", fname, exc)
        raise HomeAssistantError(exc)
    except jinja2.TemplateSyntaxError as exc:
        _LOGGER.error("Jinja2 syntax error in %s line %d: %s", fname, exc.lineno, exc.message)
        raise HomeAssistantError(exc)
    except jinja2.TemplateError as exc:
        _LOGGER.error("Jinja2 render error in %s: %s", fname, exc)
        raise HomeAssistantError(exc)
    except Exception as exc:
        _LOGGER.error("Unexpected error loading %s: %s", fname, exc, exc_info=True)
        raise HomeAssistantError(exc)


def _include_yaml(ldr, node):
    args = {}
    if isinstance(node.value, str):
        fn = node.value
    else:
        fn, args, *_ = ldr.construct_sequence(node)
    fname = os.path.abspath(os.path.join(os.path.dirname(ldr.name), fn))
    # 5X-B10: Enforce path boundary — reject includes that resolve outside HA config dir
    if not _jinja_base_dir:
        raise HomeAssistantError("!include rejected: YAML environment not initialized")
    config_real = os.path.realpath(_jinja_base_dir)
    fname_real = os.path.realpath(fname)
    if not fname_real.startswith(config_real + os.sep) and fname_real != config_real:
        _LOGGER.error("!include path traversal blocked: %s (resolved to %s, outside %s)", fn, fname_real, config_real)
        raise HomeAssistantError(f"!include path traversal blocked: {fn}")
    _LOGGER.debug("!include resolving: %s → %s", fn, fname)
    try:
        result = load_yamll(fname, ldr.secrets, args=args)
        _LOGGER.debug("!include loaded: %s (%s)", fname, type(result).__name__)
        return loader._add_reference(result, ldr, node)
    except FileNotFoundError as exc:
        _LOGGER.error("!include file not found: %s (resolved from %s in %s)", fname, fn, ldr.name)
        raise HomeAssistantError(exc)

# 5X-B42 / #127, #135: Constructor scoped to our private loader subclass only.
# Previously: `loader.PythonSafeLoader.add_constructor("!include", _include_yaml)` and
# `loader.load_yaml = load_yamll` mutated annotatedyaml globally, affecting every
# other HA integration that used the shared loader.
LcarsPythonSafeLoader.add_constructor("!include", _include_yaml)


async def process_yaml(hass: HomeAssistant, config_entry):
    """Process all YAML files for LCARS Dashboard."""
    _LOGGER.debug("process_yaml starting for config_entry: %s", config_entry.entry_id if config_entry else 'None')

    # Scope Jinja2 loader to HA config directory
    init_jinja_env(hass.config.config_dir)

    # Check for HKI installation
    hki_path = hass.config.path("hki-user/config")
    if await hass.async_add_executor_job(os.path.exists, hki_path):
        # 5X-B41 / #126: walk + read in executor; both _find_files and load_yamll
        # do synchronous IO that would block the HA event loop.
        def _load_hki_files():
            results = []
            for fname in loader._find_files(hki_path, "*.yaml"):
                loaded_yaml = load_yamll(fname)
                if isinstance(loaded_yaml, dict):
                    results.append(loaded_yaml)
            return results

        loaded_chunks = await hass.async_add_executor_job(_load_hki_files)
        for chunk in loaded_chunks:
            llgen_config.update(chunk)

    configs_path = hass.config.path("lcars-dashboard/configs")
    if await hass.async_add_executor_job(os.path.exists, configs_path):
        more_pages_dir = hass.config.path("lcars-dashboard/configs/more_pages")
        if await hass.async_add_executor_job(os.path.isdir, more_pages_dir):
            subdirs = await hass.async_add_executor_job(os.listdir, more_pages_dir)
            for subdir in subdirs:
                # WORF-SEC-006: Validate subdirectory names
                if not _is_safe_dirname(subdir):
                    _LOGGER.warning("Skipping invalid more_pages dirname: %r", subdir)
                    continue
                page_path = hass.config.path(f"lcars-dashboard/configs/more_pages/{subdir}/page.yaml")
                config_rel = f"lcars-dashboard/configs/more_pages/{subdir}/config.yaml"
                config_path = hass.config.path(config_rel)
                if not await hass.async_add_executor_job(os.path.exists, page_path):
                    continue
                if not await hass.async_add_executor_job(os.path.exists, config_path):
                    # Create default config.yaml
                    page_data = OrderedDict({"name": subdir, "icon": "mdi:puzzle"})
                    await _write_yaml_safe(hass, config_path, page_data)
                    lcars_dashboard_more_pages[subdir] = {
                        "name": subdir,
                        "icon": "mdi:puzzle",
                        "path": f"lcars-dashboard/configs/more_pages/{subdir}/page.yaml",
                    }
                else:
                    try:
                        filecontent = await _read_yaml_safe(hass, config_path)
                        if filecontent and "name" in filecontent and "icon" in filecontent:
                            lcars_dashboard_more_pages[subdir] = {
                                "name": filecontent["name"],
                                "icon": filecontent["icon"],
                                "path": f"lcars-dashboard/configs/more_pages/{subdir}/page.yaml",
                            }
                        else:
                            _LOGGER.warning("Invalid config.yaml in %s: Missing 'name' or 'icon'", subdir)
                    except Exception as e:
                        _LOGGER.error("Failed to read config.yaml in %s: %s", subdir, e)

        hass.bus.async_fire("lcars_dashboard_reload")

    async def handle_reload(call):
        #Service call to reload LCARS Dashboard config
        _LOGGER.warning("Reload LCARS Dashboard Configuration")

        await reload_configuration(hass)

    # Register service lcars_dashboard.reload
    hass.services.async_register(DOMAIN, "reload", handle_reload)



async def reload_configuration(hass):
    _LOGGER.warning('Reload YAML configuration files...!')

    # DATA-017: Clear global mutable state to prevent stale entries on reload
    global lcars_dashboard_more_pages, llgen_config
    lcars_dashboard_more_pages = {}
    llgen_config = {}

    # Ensure Jinja2 env is scoped to config dir
    init_jinja_env(hass.config.config_dir)

    configs_path = hass.config.path("lcars-dashboard/configs")
    if await hass.async_add_executor_job(os.path.exists, configs_path):
        more_pages_dir = hass.config.path("lcars-dashboard/configs/more_pages")
        if await hass.async_add_executor_job(os.path.isdir, more_pages_dir):
            subdirs = await hass.async_add_executor_job(os.listdir, more_pages_dir)
            for subdir in subdirs:
                # WORF-SEC-006: Validate subdirectory names
                if not _is_safe_dirname(subdir):
                    _LOGGER.warning("Skipping invalid more_pages dirname: %r", subdir)
                    continue
                page_path = hass.config.path(f"lcars-dashboard/configs/more_pages/{subdir}/page.yaml")
                config_rel = f"lcars-dashboard/configs/more_pages/{subdir}/config.yaml"
                config_path = hass.config.path(config_rel)
                if not await hass.async_add_executor_job(os.path.exists, page_path):
                    continue
                if not await hass.async_add_executor_job(os.path.exists, config_path):
                    page_data = OrderedDict({"name": subdir, "icon": "mdi:puzzle"})
                    await _write_yaml_safe(hass, config_path, page_data)
                    lcars_dashboard_more_pages[subdir] = {
                        "name": subdir,
                        "icon": "mdi:puzzle",
                        "path": f"lcars-dashboard/configs/more_pages/{subdir}/page.yaml",
                    }
                else:
                    filecontent = await _read_yaml_safe(hass, config_path)
                    if filecontent and "name" in filecontent and "icon" in filecontent:
                        lcars_dashboard_more_pages[subdir] = {
                            "name": filecontent["name"],
                            "icon": filecontent["icon"],
                            "path": f"lcars-dashboard/configs/more_pages/{subdir}/page.yaml",
                        }
                    else:
                        _LOGGER.warning("Invalid config.yaml in %s during reload", subdir)

    hass.bus.async_fire("lcars_dashboard_reload")