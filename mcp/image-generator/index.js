import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { AzureOpenAI } from "openai";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Resolve project root (two levels up from mcp/image-generator/)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");
const MOCKUP_DIR = path.join(PROJECT_ROOT, ".github", "agents", "wesley");

let _openai;
function getOpenAI() {
  if (!_openai) {
    // AzureOpenAI reads AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, OPENAI_API_VERSION from env
    _openai = new AzureOpenAI();
  }
  return _openai;
}

const server = new McpServer({
  name: "image-generator",
  version: "1.0.0",
});

// ---------------------------------------------------------------------------
// Tool: generate_image
// ---------------------------------------------------------------------------
server.tool(
  "generate_image",
  "Generate an LCARS dashboard mockup image using OpenAI image generation. " +
    "Saves the result to .github/agents/wesley/ and returns the image.",
  {
    prompt: z
      .string()
      .describe(
        "Detailed image generation prompt. Include LCARS design specifics: " +
          "colors (#FF9900, #CC99CC, #9999FF, #FF9966, #FFCC99, #99CCFF), " +
          "rounded rectangles, pill shapes, typography, dark backgrounds."
      ),
    filename: z
      .string()
      .describe(
        "Filename for the saved image (without extension). " +
          "Use descriptive kebab-case names like 'tactical-dashboard-v2' or 'power-panel-mockup'."
      ),
    size: z
      .enum(["1024x1024", "1024x1536", "1536x1024", "auto"])
      .default("1536x1024")
      .describe("Image dimensions. Use 1536x1024 for landscape dashboard mockups."),
    quality: z
      .enum(["low", "medium", "high", "auto"])
      .default("high")
      .describe("Image quality level."),
    deployment: z
      .string()
      .default("gpt-image-1")
      .describe(
        "Azure OpenAI deployment name for the image model. " +
          "Must match a deployment in your Azure OpenAI resource (e.g. gpt-image-1)."
      ),
  },
  async ({ prompt, filename, size, quality, deployment }) => {
    // Sanitize filename to prevent path traversal
    const safeName = path.basename(filename).replace(/[^a-zA-Z0-9_-]/g, "_");
    if (!safeName) {
      return {
        content: [{ type: "text", text: "Error: Invalid filename provided." }],
        isError: true,
      };
    }

    try {
      const params = {
        model: deployment || "gpt-image-1",
        prompt,
        n: 1,
        size: size || "1536x1024",
      };

      // gpt-image-1 supports: 1024x1024, 1024x1536, 1536x1024
      // No size remapping needed for gpt-image-1

      // gpt-image-1 uses "low" / "medium" / "high" / "auto" quality
      params.quality = quality || "high";

      const result = await getOpenAI().images.generate(params);

      const b64 = result.data[0].b64_json;
      if (!b64) {
        return {
          content: [
            {
              type: "text",
              text: "Error: API did not return base64 image data. Check model and parameters.",
            },
          ],
          isError: true,
        };
      }

      // Save to disk
      await fs.mkdir(MOCKUP_DIR, { recursive: true });
      const filePath = path.join(MOCKUP_DIR, `${safeName}.png`);
      await fs.writeFile(filePath, Buffer.from(b64, "base64"));

      const relativePath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, "/");

      return {
        content: [
          { type: "image", data: b64, mimeType: "image/png" },
          {
            type: "text",
            text: `Image saved to: ${relativePath}\nDeployment: ${deployment}\nSize: ${params.size}\nQuality: ${params.quality}`,
          },
        ],
      };
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Image generation failed: ${err.message}`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: list_mockups
// ---------------------------------------------------------------------------
server.tool(
  "list_mockups",
  "List all mockup images in the Wesley design folder (.github/agents/wesley/). " +
    "Use this to see what reference images and mockups already exist before generating new ones.",
  {},
  async () => {
    try {
      const entries = await fs.readdir(MOCKUP_DIR, { withFileTypes: true });
      const images = entries
        .filter(
          (e) => e.isFile() && /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(e.name)
        )
        .map((e) => e.name);

      if (images.length === 0) {
        return {
          content: [{ type: "text", text: "No mockup images found in .github/agents/wesley/" }],
        };
      }

      const list = images.map((f) => `  - ${f}`).join("\n");
      return {
        content: [
          {
            type: "text",
            text: `Found ${images.length} mockup image(s) in .github/agents/wesley/:\n${list}`,
          },
        ],
      };
    } catch {
      return {
        content: [
          {
            type: "text",
            text: "Mockup folder (.github/agents/wesley/) does not exist yet. " +
              "It will be created when the first image is generated.",
          },
        ],
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Tool: delete_mockup
// ---------------------------------------------------------------------------
server.tool(
  "delete_mockup",
  "Delete a mockup image from the Wesley design folder. Use to clean up outdated designs.",
  {
    filename: z
      .string()
      .describe("Filename to delete (with or without .png extension)."),
  },
  async ({ filename }) => {
    const safeName = path.basename(filename);
    const fullName = safeName.endsWith(".png") ? safeName : `${safeName}.png`;
    const filePath = path.join(MOCKUP_DIR, fullName);

    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      return {
        content: [{ type: "text", text: `Deleted: ${fullName}` }],
      };
    } catch {
      return {
        content: [{ type: "text", text: `File not found: ${fullName}` }],
        isError: true,
      };
    }
  }
);

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  process.stderr.write(`MCP server failed to start: ${err.message}\n`);
  process.exit(1);
});
