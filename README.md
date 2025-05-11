# Synapse

Synapse (`sy`) is a lightweight command-line utility that serves as a quick conduit to your favorite LLM. It allows you to interact with LLMs directly from your terminal, supporting various input methods and configurable profiles.

## Features

- Stream LLM responses directly to your terminal
- Support for piped input
- User-defined profiles with custom system prompts
- User-defined models with multiple provider support
- Conversation history and continuation
- Interactive chat mode (coming soon!)

## Installation

```shell
npm install -g @drewzemke/synapse
```

## Usage

> **NOTE**: Synapse supports multiple LLM providers including Anthropic, OpenAI, and OpenRouter. You'll need to set the appropriate API key for your chosen provider in your environment.

```shell
# Set the API key for your preferred provider
export ANTHROPIC_API_KEY=<your-anthropic-api-key>
# or
export OPENAI_API_KEY=<your-openai-api-key>
# or
export OPENROUTER_API_KEY=<your-openrouter-api-key>

# Send a simple query to the LLM (responses stream to the terminal)
sy "What is a binary tree?"

# Use a specific user-defined profile for a query
sy -p coding "Explain recursion"

# Use a specific model defined in your config
sy -m gpt4 "Compare GPT-4 with Claude"

# Mix and match profiles with different models
sy -p coding -m gpt4 "Explain promises in JavaScript"

# Continue the previous conversation
sy -e "Can you provide an example?"

# Continue a conversation using a specific model
sy -e -m claude "Can you elaborate on that?"

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

### General Settings

```toml
# General settings
[general]
stream = true  # Whether to stream responses by default
```

### Profiles Configuration

Profiles allow you to define different system prompts and temperature settings for different use cases.

```toml
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

### Models Configuration

You can define custom models to use with different providers. The "provider" field must be one of the supported providers ('anthropic', 'openai', or 'openrouter'), and the "model" field should be a valid model string for that provider.

```toml
# Anthropic model configuration
[models.claude]
provider = "anthropic"
model = "claude-3-7-sonnet-latest"

# OpenAI model configuration
[models.gpt4]
provider = "openai"
model = "gpt-4-turbo"

# OpenRouter model configuration
[models.or-claude]
provider = "openrouter"
model = "anthropic/claude-3.5-sonnet"
```

For model strings, please refer to each provider's documentation:
- Anthropic: https://docs.anthropic.com/claude/docs/models-overview
- OpenAI: https://platform.openai.com/docs/models
- OpenRouter: https://openrouter.ai/docs

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
