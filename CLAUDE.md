# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.



## Commands

-   **Build the project**:
    ```bash
    npm run build
    ```
-   **Start the router server**:
    ```bash
    ccr start
    ```
-   **Stop the router server**:
    ```bash
    ccr stop
    ```
-   **Restart the router server**:
    ```bash
    ccr restart
    ```
-   **Check the server status**:
    ```bash
    ccr status
    ```
-   **Run Claude Code through the router**:
    ```bash
    ccr code "<your prompt>"
    ```
-   **Open the web UI**:
    ```bash
    ccr ui
    ```
-   **Release a new version**:
    ```bash
    npm run release
    ```

## Architecture

This project is a TypeScript-based router for Claude Code requests. It allows routing requests to different large language models (LLMs) from various providers based on custom rules.

### Core Components

-   **Entry Point**: The main command-line interface logic is in `src/cli.ts`. It handles parsing commands like `start`, `stop`, `code`, `ui`, and `restart`.
-   **Server**: The `ccr start` command launches a server that listens for requests from Claude Code. The server logic is initiated from `src/index.ts` and uses `src/server.ts` for HTTP server setup.
-   **Configuration**: The router is configured via a JSON file located at `~/.claude-code-router/config.json`. This file defines API providers, routing rules, and custom transformers. An example can be found in `config.example.json`.
-   **Routing**: The core routing logic in `src/utils/router.ts` determines which LLM provider and model to use for a given request. It supports default routes for different scenarios (`default`, `background`, `think`, `longContext`, `webSearch`) and can be extended with a custom JavaScript router file.
-   **Process Management**: The service runs as a background process with PID file management handled by `src/utils/processCheck.ts`.
-   **Authentication**: API key authentication is handled by `src/middleware/auth.ts`.

### Key Features

-   **Model Routing**: Automatically routes requests based on token count, model type, thinking mode, web search tools, or custom rules
-   **Multi-Provider Support**: Supports various LLM providers including OpenRouter, DeepSeek, Ollama, Gemini, and others
-   **Transformers**: Request/response transformers adapt different provider APIs to work with Claude Code
-   **Web UI**: A React-based web interface for configuration management located in the `ui/` directory
-   **Custom Router**: Support for custom JavaScript routing logic via `CUSTOM_ROUTER_PATH` configuration
-   **Subagent Routing**: Special routing for subagents using `<CCR-SUBAGENT-MODEL>` tags in system prompts

### Dependencies

-   **@musistudio/llms**: Core library for LLM provider integration, built on Fastify
-   **Fastify**: HTTP server framework with hooks and middleware support
-   **tiktoken**: Token counting for routing decisions
-   **esbuild**: Build tool for TypeScript compilation

### Configuration Structure

The `config.json` file contains:
- `Providers`: Array of LLM provider configurations with API endpoints, keys, and models
- `Router`: Routing rules for different scenarios (default, background, think, longContext, webSearch)
- `APIKEY`: Authentication key for securing the router
- `HOST`: Server host address (defaults to 127.0.0.1 if no APIKEY)
- `PORT`: Server port (defaults to 3456)
- `CUSTOM_ROUTER_PATH`: Path to custom JavaScript router file
- `transformers`: Custom transformer configurations

### Development Notes

- The service automatically starts Claude Code configuration in `~/.claude.json` if it doesn't exist
- The router server includes REST API endpoints for configuration management (`/api/config`, `/api/transformers`, `/api/restart`)
- Static files for the web UI are served from the `/ui/` endpoint
- The build process uses a custom script in `scripts/build.js` rather than standard TypeScript compilation