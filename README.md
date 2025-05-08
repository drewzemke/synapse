# Synapse CLI

Synapse (`sy`) is a lightweight command-line utility that serves as a quick conduit to Large Language Models (LLMs). It allows users to interact with LLMs directly from their terminal, supporting various input methods and configurable profiles.

## Features

- Command-line invocation with direct LLM interaction
- Support for piped input
- Configurable LLM provider selection
- User-defined profiles with custom system prompts, temperature, and max token settings
- Conversation history support
- Streaming responses by default
- Verbose mode for configuration and usage diagnostics
- Interactive chat mode
- Cross-platform compatibility

## Installation

```bash
# Not yet published to NPM
# Coming soon
```

## Configuration

Synapse can be configured using a TOML file. The configuration file is automatically loaded from:

- **Linux/macOS**: `~/.config/synapse/config.toml`
- **Windows**: `%APPDATA%\synapse\config.toml`

The directory will be created automatically on first run if it doesn't exist.

### Example Configuration

```toml
# General settings
[general]
stream = true  # Whether to stream responses by default

# Default profile
[profiles.default]
system_prompt = "You are a helpful AI assistant."
temperature = 0.7

# Custom profile for coding tasks
[profiles.coding]
system_prompt = "You are a coding assistant. Provide concise, practical answers with code examples."
temperature = 0.2

# Custom profile for creative writing
[profiles.creative]
system_prompt = "You are a creative writing assistant. Be imaginative and inspiring."
temperature = 0.9
```

## Usage

```bash
# Send a simple query to the LLM (responses stream to the terminal)
sy "What is a binary tree?"

# Use a specific profile for a query
sy -p coding "Explain recursion"

# Start an interactive chat session (NOTE: not yet implemented!)
sy --chat

# Pipe content as context for the query
cat file.js | sy "Explain this code"

# Use verbose mode to see configuration and diagnostic information
sy -v "Explain quantum computing"
```

## Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build the project
pnpm build

# Format code with BiomeJS
pnpm lint
pnpm lint:fix

# Run tests
pnpm test

# Run tests in watch mode during development
pnpm test:watch
```

## License

MIT
