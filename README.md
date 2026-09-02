# shortcut-mcp

Read-only MCP server for Shortcut (app.shortcut.com). Runs locally over stdio,
connects to Claude Desktop. Wraps four endpoints — read only.

## Endpoints wrapped

- `GET /epics`
- `GET /epics/{epic-public-id}/stories`
- `GET /stories/{story-public-id}`

## Setup

```bash
cp example.env .env # and fill in your API token
npm install
```

Token: https://app.shortcut.com/your-shortcut-workspace/settings/account/api-tokens

## Claude Desktop config

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "shortcut": {
      "command": "node",
      "args": ["/full-path-to-your-project/index.js"]
    }
  }
}
```
