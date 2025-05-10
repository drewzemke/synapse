# Synapse

Synapse (`sy`) is a lightweight command-line utility that serves as a quick conduit to your favorite LLM. It allows you to interact with LLMs directly from your terminal, supporting various input methods and configurable profiles.

## Features

- Stream LLM responses directly to your terminal
- Support for piped input
- User-defined profiles with custom system prompts
- Conversation history and continuation
- Interactive chat mode (coming soon!)
- Configurable LLM provider selection (coming soon!)

## Installation

```shell
npm install -g @drewzemke/synapse
```

## Usage

> **NOTE**: For the moment, Synapse only supports Anthropic's API and is hardcoded to use Claude Sonnet 3.7. This will be made configurable soon.

```shell
# ANTHROPIC_API_KEY must be set in your shell environment
export ANTHROPIC_API_KEY=<your-api-key>

# Send a simple query to the LLM (responses stream to the terminal)
sy "What is a binary tree?"

# Use a specific user-defined profile for a query
sy -p coding "Explain recursion"

# Continue the previous conversation
sy -e "Can you provide an example?"

# Show the last response from the LLM
sy -l

# Start an interactive chat session (NOTE: not yet implemented!)
sy --chat

# Pipe content as context for the query
cat file.js | sy "Explain this code"

# Use verbose mode to see configuration and diagnostic information
sy -v "Explain quantum computing"
```

### Continuing Conversations

Synapse automatically saves your conversation history, making it easy to continue discussions with the LLM.
When you use the `-e` or `--extend` flag, Synapse will load your most recent conversation and send the entire conversation history to the LLM for context.

```shell
# Ask an initial question
sy "What are the SOLID principles in software design?"

# Continue the conversation with follow-up questions
sy -e "Can you explain the first one in more detail?"
sy -e "How does that compare to the Open/Closed Principle?"
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

## Development

```shell
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
pnpm test:watch
```


## License

MIT
