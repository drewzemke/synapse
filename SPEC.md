# Synapse: Lightweight CLI LLM Interface

## Project Description

Synapse (executable: `sy`) is a lightweight command-line utility that serves as a quick conduit to Large Language Models (LLMs). It allows users to interact with LLMs directly from their terminal, supporting various input methods and configurable profiles.

## Primary Features

- Command-line invocation with direct LLM interaction
- Support for piped input
- Configurable LLM provider selection
- User-defined profiles with custom system prompts, temperature, and max token settings
- Conversation history support
- Streaming responses by default
- Verbose mode for configuration and usage diagnostics
- Interactive chat mode
- Cross-platform compatibility
- Support for connecting to local MCP servers
- Clear and concise error handling
- Adherence to Unix philosophy of small, focused tools

## User Flows

1. **Quick Query:**
   ```sh
   sy "What is a binary tree?"
   ```
   The LLM response streams directly to the terminal.

2. **Using a Specific Profile:**
   ```sh
   sy coding-assistant "Explain the concept of recursion"
   ```
   Uses the "coding-assistant" profile settings for the query.

3. **Piped Input with Additional Context:**
   ```sh
   cat component.jsx | sy "Refactor this React component into subcomponents"
   ```
   Sends both the file contents and the additional prompt to the LLM.

4. **Interactive Chat Session:**
   ```sh
   sy --chat "How do I configure tailwind?"
   ```
   Initiates an interactive chat session with the LLM with an initial message.

## Implementation Details

- **Language:** TypeScript
- **LLM Interaction:** Vercel AI SDK
- **Initial LLM Provider:** Anthropic API (Claude)
- **Future LLM Providers:** OpenAI, AWS Bedrock, OpenRouter
- **Distribution:** NPM package
- **Command-line Parsing:** Yargs
- **TOML Parsing:** `toml` npm package
- **Testing Framework:** Vitest
- **Terminal Coloring:** Chalk
- **Linting and Formatting:** BiomeJS
- **Development Runtime:** tsx
- **Package Manager:** pnpm
- **CI/CD:** GitHub Actions for NPM publishing

### Configuration Management
- Configuration files will be stored in the user's OS-specific data directory
- Profile configurations will be stored in TOML files in the user's `.config` directory (or OS equivalent)
- API keys will be managed in a separate TOML file adjacent to the normal configuration file for security
- Custom module for cross-platform config directory detection using `node:os`

### User Experience
- Streaming responses by default for all queries
- Conversation history stored in user's OS data directory
- Verbose mode (`--verbose` or `-v` flag) will display configuration and usage diagnostics alongside the LLM response
- Error messages will be communicated clearly and briefly to the user
- Following Unix philosophy, the tool won't implement features that can be accomplished by other common tools (e.g., output to file can be done with `> file.txt`)
