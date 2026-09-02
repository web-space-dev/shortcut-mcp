# shortcut-mcp

Read-only MCP server for Shortcut (app.shortcut.com). Runs locally over stdio,
connects to Claude Desktop. Wraps four endpoints — no writes, no risk of
touching your data.

## Endpoints wrapped

- `GET /epics`
- `GET /epics/{epic-public-id}/stories`
- `GET /stories/{story-public-id}`
- `GET /objectives` _(verify this exists in current docs before relying on it — not confirmed)_

## Setup

```bash
cp example.env .env # and fill in your API token
npm install
```

Token: https://app.shortcut.com/settings/account/api-tokens

## Claude Desktop config

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "shortcut": {
      "command": "node",
      "args": ["/Users/eoan/Sites/webspace/claude-shortcut-mcp/index.js"]
    }
  }
}
```

## Status

Scaffold only. No tool implementations yet.
