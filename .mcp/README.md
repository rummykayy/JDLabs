# Local Supabase Helper (MCP Alternative)

This folder contains a local alternative to Supabase MCP that can be used within this project.

## Why This Exists

MCP servers are global to Claude Code and only load at startup. Since this session started before MCP was configured, we created this project-local helper to provide similar functionality.

## Usage

### Command Line Interface

```bash
# Full database inspection
node .mcp/supabase-helper.js inspect

# List all tables
node .mcp/supabase-helper.js tables

# Get schema for a specific table
node .mcp/supabase-helper.js schema users
node .mcp/supabase-helper.js schema interviews

# Query a table
node .mcp/supabase-helper.js query users 5
node .mcp/supabase-helper.js query interviews 10

# Check RLS status
node .mcp/supabase-helper.js rls

# List storage buckets
node .mcp/supabase-helper.js buckets
```

### Use as Module

```javascript
const {
  supabase,
  listTables,
  getTableSchema,
  queryDatabase,
  checkRLSStatus,
  listStorageBuckets,
  inspect
} = require('./.mcp/supabase-helper');

// Use in your scripts
await inspect();
await listTables();
await getTableSchema('users');
await queryDatabase('interviews', { status: 'completed' }, 10);
```

## Available Commands

| Command | Description | Example |
|---------|-------------|---------|
| `inspect` | Full database inspection | `node .mcp/supabase-helper.js inspect` |
| `tables` or `list` | List all tables with row counts | `node .mcp/supabase-helper.js tables` |
| `schema <table>` | Show table schema | `node .mcp/supabase-helper.js schema users` |
| `query <table> [limit]` | Query table data | `node .mcp/supabase-helper.js query jobs 5` |
| `rls` | Check RLS status on all tables | `node .mcp/supabase-helper.js rls` |
| `buckets` | List storage buckets | `node .mcp/supabase-helper.js buckets` |

## Features

- ✅ List all database tables
- ✅ Get table schemas
- ✅ Query table data with filters
- ✅ Check RLS policy status
- ✅ List storage buckets
- ✅ Full database inspection
- ✅ Uses same credentials as your app
- ✅ Safe read-only operations

## Configuration

Uses environment variables from `.env.local`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

Falls back to hardcoded values if not set.

## When to Use Real MCP

This helper is a temporary solution. For MCP to work:

1. Restart Claude Code completely
2. Start a new conversation
3. MCP servers will load from `~/.claude/claude_desktop_config.json`

Check if MCP is active by looking for tools like:
- `mcp__supabase_query`
- `mcp__supabase_list_tables`
- `mcp__supabase_get_schema`

## Notes

- This helper provides read-only access for safety
- Uses the same Supabase client as your application
- Does not require MCP to be active
- Can be used in any Node.js script
