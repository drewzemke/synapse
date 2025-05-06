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

## Usage

```bash
# Send a simple query to the LLM (responses stream to the terminal)
sy "What is a binary tree?"

# Use a specific profile for a query
sy -p coding "Explain recursion"

# Start an interactive chat session
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
pnpm run format
```

## License

MIT
