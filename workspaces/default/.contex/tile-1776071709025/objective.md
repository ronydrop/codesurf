# Objective

## Available Skills & Tools
- @mcp:contex (contex) — http://127.0.0.1:61538/mcp
- @mcp:context7 (context7) — npx
- @mcp:sequential-thinking (sequential-thinking) — npx
- @mcp:fetch (fetch) — npx
- @mcp:memory (memory) — npx
- @mcp:postgres (postgres) — npx

## Communication Protocol
Use these MCP tools to report progress:

| Tool | When |
|------|------|
| update_task(channel, task_id, status) | Update task status |
| create_task(channel, title) | Create a new task |
| reload_objective(tile_id) | Get latest objective |
| pause_task(channel, task_id, reason) | Pause a task |
| get_context(tile_id) | Read context files |
| notify(channel, message) | Send notification |

Your tile channel: tile:tile-1776071709025

## Rules
1. Re-read this file when you receive a reload signal
2. Update task status via MCP tools as you work
3. Call notify when you need human attention

Generated: 2026-04-13T09:52:31.140Z