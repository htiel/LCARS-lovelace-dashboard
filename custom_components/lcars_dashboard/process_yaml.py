import logging
import yaml
import os
import json
import io
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
    """Get or create the sandboxed Jinja2 environment, scoped to config_dir."""
    global _jinja_env, _jinja_base_dir
    if _jinja_env is None or (config_dir and config_dir != _jinja_base_dir):
        base = config_dir or _jinja_base_dir or "/"
        _jinja_base_dir = base
        _jinja_env = SandboxedEnvironment(loader=jinja2.FileSystemLoader(base))
        _jinja_env.filters['fromjson'] = fromjson
    return _jinja_env

def init_jinja_env(config_dir):
    """Initialize the Jinja2 environment with the HA config directory."""
    _get_jinja_env(config_dir)

lcars_dashboard_more_pages = {}
llgen_config = {}

def _is_our_file(fname):
    """Check if a file belongs to LCARS Dashboard (skip noisy logging for other HA YAML)."""
    return 'lcars_dashboard' in fname or 'lcars-dashboard' in fname


def load_yamll(fname, secrets = None, args={}):
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
            data = loader.yaml.load(stream, Loader=lambda _stream: loader.PythonSafeLoader(_stream, secrets)) or OrderedDict()
            _LOGGER.debug("Parsed YAML from Jinja2: %s → %s (%d items)", fname, type(data).__name__, len(data) if isinstance(data, (dict, list)) else 0)
            return data
        else:
            with open(fname, encoding="utf-8") as config_file:
                data = loader.yaml.load(config_file, Loader=lambda stream: loader.PythonSafeLoader(stream, secrets)) or OrderedDict()
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
    _LOGGER.debug("!include resolving: %s → %s", fn, fname)
    try:
        result = load_yamll(fname, ldr.secrets, args=args)
        _LOGGER.debug("!include loaded: %s (%s)", fname, type(result).__name__)
        return loader._add_reference(result, ldr, node)
    except FileNotFoundError as exc:
        _LOGGER.error("!include file not found: %s (resolved from %s in %s)", fname, fn, ldr.name)
        raise HomeAssistantError(exc)

loader.load_yaml = load_yamll
loader.PythonSafeLoader.add_constructor("!include", _include_yaml)

def compose_node(self, parent, index):
    if self.check_event(yaml.events.AliasEvent):
        event = self.get_event()
        anchor = event.anchor
        if anchor not in self.anchors:
            raise yaml.composer.ComposerError(None, None, "found undefined alias %r"
                    % anchor, event.start_mark)
        return self.anchors[anchor]
    event = self.peek_event()
    anchor = event.anchor
    self.descend_resolver(parent, index)
    if self.check_event(yaml.events.ScalarEvent):
        node = self.compose_scalar_node(anchor)
    elif self.check_event(yaml.events.SequenceStartEvent):
        node = self.compose_sequence_node(anchor)
    elif self.check_event(yaml.events.MappingStartEvent):
        node = self.compose_mapping_node(anchor)
    self.ascend_resolver()
    return node

yaml.composer.Composer.compose_node = compose_node


async def process_yaml(hass: HomeAssistant, config_entry):
    """Process all YAML files for LCARS Dashboard."""
    _LOGGER.debug("process_yaml starting for config_entry: %s", config_entry.entry_id if config_entry else 'None')

    # Scope Jinja2 loader to HA config directory
    init_jinja_env(hass.config.config_dir)

    # Check for HKI installation
    if os.path.exists(hass.config.path("hki-user/config")):
        #_LOGGER.warning("HKI Installed!")
        for fname in loader._find_files(hass.config.path("hki-user/config"), "*.yaml"):
            loaded_yaml = load_yamll(fname)
            if isinstance(loaded_yaml, dict):
                llgen_config.update(loaded_yaml)

    if os.path.exists(hass.config.path("lcars-dashboard/configs")):
        if os.path.isdir(hass.config.path("lcars-dashboard/configs/more_pages")):
            #for subdir in os.listdir(hass.config.path("lcars-dashboard/configs/more_pages")):
            more_pages_path = hass.config.path("lcars-dashboard/configs/more_pages")
            subdirs = await hass.async_add_executor_job(os.listdir, more_pages_path)
            for subdir in subdirs:
                #Lets check if there is a page.yaml in the more_pages folder
                if os.path.exists(hass.config.path("lcars-dashboard/configs/more_pages/"+subdir+"/page.yaml")):
                    # Page.yaml exists now check if there is a config.yaml otherwise create it
                    if not os.path.exists(hass.config.path("lcars-dashboard/configs/more_pages/"+subdir+"/config.yaml")):
                        #_LOGGER.warning(f"process_yaml() config.yaml does not exist, {subdir}")
                        #with open(hass.config.path("lcars-dashboard/configs/more_pages/"+subdir+"/config.yaml"), 'w') as f:
                        file_content = await hass.async_add_executor_job(open, hass.config.path("lcars-dashboard/configs/more_pages/"+subdir+"/config.yaml"), "w")
                        with file_content as f:
                            page_config = OrderedDict()
                            page_config.update({
                                "name": subdir,
                                "icon": "mdi:puzzle"
                            })
                            yaml.safe_dump(page_config, f, default_flow_style=False)
                            lcars_dashboard_more_pages[subdir] = {
                                "name": subdir,
                                "icon": "mdi:puzzle",
                                "path": "lcars-dashboard/configs/more_pages/"+subdir+"/page.yaml",
                            }
                    else:
                        #_LOGGER.warning(f"process_yaml() config.yaml exists, {subdir}")
                        try:
                            #with open(hass.config.path("lcars-dashboard/configs/more_pages/"+subdir+"/config.yaml")) as f:
                            data = await hass.async_add_executor_job(open, hass.config.path("lcars-dashboard/configs/more_pages/"+subdir+"/config.yaml"), "r")
                            with data as f:
                                filecontent = yaml.safe_load(f)

                                #_LOGGER.warning(f"FILE CONTENT: {filecontent}")
                                if "name" in filecontent and "icon" in filecontent:
                                    lcars_dashboard_more_pages[subdir] = {
                                        "name": filecontent["name"],
                                        "icon": filecontent["icon"],
                                        "path": "lcars-dashboard/configs/more_pages/"+subdir+"/page.yaml",
                                    }
                                else:
                                    _LOGGER.warning(f"Invalid config.yaml in {subdir}: Missing 'name' or 'icon'")
                        except Exception as e:
                            _LOGGER.error(f"Failed to read config.yaml in {subdir}: {e}")

        hass.bus.async_fire("lcars_dashboard_reload")

    async def handle_reload(call):
        #Service call to reload LCARS Dashboard config
        _LOGGER.warning("Reload LCARS Dashboard Configuration")

        await reload_configuration(hass)

    # Register service lcars_dashboard.reload
    hass.services.async_register(DOMAIN, "reload", handle_reload)



async def reload_configuration(hass):
    _LOGGER.warning('Reload YAML configuration files...!')

    # Ensure Jinja2 env is scoped to config dir
    init_jinja_env(hass.config.config_dir)

    if os.path.exists(hass.config.path("lcars-dashboard/configs")):
        if os.path.isdir(hass.config.path("lcars-dashboard/configs/more_pages")):
            #for subdir in os.listdir(hass.config.path("lcars-dashboard/configs/more_pages")):
            more_pages_path = hass.config.path("lcars-dashboard/configs/more_pages")
            subdirs = await hass.async_add_executor_job(os.listdir, more_pages_path)
            for subdir in subdirs:
                #Lets check if there is a page.yaml in the more_pages folder
                if os.path.exists(hass.config.path("lcars-dashboard/configs/more_pages/"+subdir+"/page.yaml")):
                    page_config = hass.config.path("lcars-dashboard/configs/more_pages/"+subdir+"/config.yaml")
                    #Page.yaml exists now check if there is a config.yaml otherwise create it
                    if not os.path.exists(page_config):
                        data = await hass.async_add_executor_job(open, page_config, "w")
                        with data as f:
                            page_config = OrderedDict()
                            page_config.update({
                                "name": subdir,
                                "icon": "mdi:puzzle"
                            })
                            yaml.safe_dump(page_config, f, default_flow_style=False)
                            lcars_dashboard_more_pages[subdir] = {
                                "name": subdir,
                                "icon": "mdi:puzzle",
                                "path": "lcars-dashboard/configs/more_pages/"+subdir+"/page.yaml",
                            }
                    else:
                        data = await hass.async_add_executor_job(open, page_config, "r")
                        with data as f:
                            filecontent = yaml.safe_load(f)
                            lcars_dashboard_more_pages[subdir] = {
                                "name": filecontent["name"],
                                "icon": filecontent["icon"],
                                "path": "lcars-dashboard/configs/more_pages/"+subdir+"/page.yaml",
                            }

    hass.bus.async_fire("lcars_dashboard_reload")