#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, ".env") });

const TOKEN = process.env.SHORTCUT_API_TOKEN;
if (!TOKEN) {
  console.error("Missing SHORTCUT_API_TOKEN env var.");
  process.exit(1);
}

const BASE = "https://api.app.shortcut.com/api/v3";

async function scRequest(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      "Shortcut-Token": TOKEN,
    },
  });
  if (!res.ok) {
    throw new Error(`Shortcut API ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

const TOOLS = [
  {
    name: "list_epics",
    description: "List all epics in the workspace.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    handler: () => scRequest("/epics"),
  },
  {
    name: "get_epic_stories",
    description: "List all stories belonging to a given epic.",
    inputSchema: {
      type: "object",
      properties: {
        epic_id: { type: "integer", description: "Epic public ID" },
      },
      required: ["epic_id"],
      additionalProperties: false,
    },
    handler: ({ epic_id }) => scRequest(`/epics/${epic_id}/stories`),
  },
  {
    name: "get_story",
    description: "Get a single story by its public ID.",
    inputSchema: {
      type: "object",
      properties: {
        story_id: { type: "integer", description: "Story public ID" },
      },
      required: ["story_id"],
      additionalProperties: false,
    },
    handler: ({ story_id }) => scRequest(`/stories/${story_id}`),
  },
  {
    name: "list_objectives",
    description:
      "List all objectives in the workspace. UNVERIFIED: this top-level endpoint was not confirmed against current docs — may 404.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    handler: () => scRequest("/objectives"),
  },
];

const server = new Server(
  { name: "shortcut-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map(({ name, description, inputSchema }) => ({
    name,
    description,
    inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = TOOLS.find((t) => t.name === req.params.name);
  if (!tool) throw new Error(`Unknown tool: ${req.params.name}`);
  try {
    const data = await tool.handler(req.params.arguments ?? {});
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  } catch (err) {
    return {
      content: [{ type: "text", text: `Error: ${err.message}` }],
      isError: true,
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
