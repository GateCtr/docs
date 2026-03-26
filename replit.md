# GateCtr Docs

A documentation site for GateCtr — an LLM gateway that sits between your app and any LLM provider.

## Project Overview

- **Type**: Documentation site (Markdown-based)
- **Language**: Python 3.11
- **Port**: 5000
- **Entry point**: `server.py`

## Architecture

This project is a pure Markdown documentation repository with a custom Python HTTP server that renders pages into a styled dark-themed HTML UI.

### Structure

- `README.md` — Introduction / landing page
- `SUMMARY.md` — Table of contents (GitBook format)
- `getting-started/` — Quickstart, authentication, first request guides
- `sdks/` — Node.js and Python SDK documentation
- `features/` — Budget Firewall, Context Optimizer, Model Router, Analytics, Webhooks
- `api-reference/` — API endpoint docs (complete, chat, usage)
- `server.py` — Python HTTP server that renders Markdown to styled HTML

### Server

`server.py` is a custom `http.server`-based Python server that:
- Parses `SUMMARY.md`-style navigation
- Renders Markdown to HTML using `python-markdown` with fenced code blocks and syntax highlighting
- Handles GitBook tab syntax (`{% tabs %}` / `{% tab %}`)
- Serves on `0.0.0.0:5000`

## Dependencies

- `markdown` — Markdown to HTML conversion
- `pygments` — Syntax highlighting (via CodeHilite extension)

## Development

The workflow `Start application` runs `python server.py` on port 5000.

## Deployment

Configured for autoscale deployment running `python server.py`.
