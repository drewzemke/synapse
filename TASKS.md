# Synapse Project Tasks

**Note:** This task list should be updated as we progress through the project. Mark tasks as completed when done, and add new tasks as they are discovered.

## Phase 1: Minimal Command-Line Setup
*Deliverable: Project structure with basic command-line argument parsing*

- [x] Set up basic project structure
  - [x] Initialize TypeScript project with pnpm
  - [x] Configure BiomeJS for linting and formatting
  - [x] Create basic directory structure
- [x] Implement minimal command-line interface
  - [x] Add Yargs for command-line parsing
  - [x] Parse simple prompt from command line
  - [x] Set up help text and basic command structure
- [x] Create basic README with project description

## Phase 2: LLM Integration (Anthropic)
*Deliverable: CLI tool that can send a prompt to Anthropic API and display the response*

- [x] Add Vercel AI SDK for LLM integration
- [x] Implement connection to Anthropic API
  - [x] Create simple API key configuration
  - [x] Set up basic error handling
- [x] Implement response display to terminal
  - [x] Add streaming support for interactive environments
  - [ ] Implement fallback for non-interactive environments
- [x] Update README with installation and usage instructions

## Phase 3: Configuration and Profiles
*Deliverable: Support for custom profiles and configuration*

- [x] Add TOML package for configuration files
- [x] Implement configuration management
  - [x] Create cross-platform config directory detection
  - [x] Create default configuration on first run
- [x] Add profile support
  - [x] Add profiles as configuration setting
  - [x] Implement profile selection from command line
  - [x] Support custom system prompts per profile
  - [x] Support custom temperature
- [x] Enable specifying default profile at top level of `config.toml`
- [x] Update documentation with configuration instructions

## Phase 4: Testing Framework
*Deliverable: Test suite for existing functionality*

- [x] Add Vitest for testing
- [x] Write unit tests for core functionality
  - [x] Command-line parsing tests
  - [x] Configuration management tests
  - [x] LLM connection tests (with mocks)
- [x] Set up test automation
- [ ] Re-add tests for `factory.ts` and add `integration.spec.ts`

## Phase 5: Enhanced Input Methods
*Deliverable: Support for piped input and file processing*

- [x] Implement piped input support
  - [x] Detect and read from stdin when available
  - [x] Combine piped content with command-line prompt
- [ ] Add Chalk for improved terminal output
- [ ] Update documentation with advanced usage examples
- [x] Write tests for input functionality

## Phase 6: Stored Conversations
*Deliverable: Ability to save conversations and continue them later*

- [x] Part 1: Conversation Storage
  - [x] Write tests for conversation storage functionality
    - [x] Test creating conversation directory
    - [x] Test saving conversation to TOML file
    - [x] Test TOML structure with profile, temperature, and messages
  - [x] Implement conversation storage
    - [x] Create conversation directory in user config location
    - [x] Design TOML structure for storing conversations
    - [x] Save most recent conversation to `last.toml`

- [x] Part 2: Conversation Continuation
  - [x] Write tests for conversation continuation functionality
    - [x] Test loading previous conversation
    - [x] Test appending new messages to loaded conversation
    - [x] Test sending full context to LLM
  - [x] Implement conversation continuation
    - [x] Implement `-e/--extend` flag to continue last conversation
    - [x] Load previous conversation when extending
    - [x] Append new user message to conversation
    - [x] Send full conversation context to LLM

- [x] Update documentation with conversation features

## Phase 7: Interactive Chat Mode
*Deliverable: Interactive chat interface with conversation history*

- [ ] Add interactive chat mode
  - [x] Implement conversation history tracking
  - [ ] Create interactive prompt interface
  - [ ] Support multi-turn conversations
  - [ ] Enable user to edit messages in $EDITOR
- [ ] Add verbose mode
  - [x] Implement token usage tracking
  - [ ] Add response time measurement
    - (separated by time to first token + streaming time)
  - [ ] Display diagnostics after response

## Phase 8: Additional LLM Providers
*Deliverable: Support for multiple LLM providers*

- [x] Add support for OpenAI
- [x] Add support for OpenRouter
- [x] Create provider selection mechanism via `models` section in config
- [x] Enable specifying default model at top level of `config.toml`
- [x] Enable specifying model via `-m/--model` in CLI
- [x] Update documentation with provider-specific instructions (namely which API key to use)
- [x] Add error handling for missing or incorrectly specified models
- [x] Add support for AWS Bedrock

## Phase 9: Polish and Distribution
*Deliverable: Production-ready package published to NPM*

- [ ] Optimize performance
  - [ ] Improve startup time
  - [x] Enhance streaming performance
- [x] Implement CI/CD pipeline
  - [x] Set up GitHub Actions for testing
  - [x] Configure NPM publishing workflow
- [ ] Add support for local MCP servers
- [ ] Create comprehensive documentation
  - [ ] Update README with all features
  - [ ] Add examples for common use cases
  - [ ] Create contribution guidelines
- [ ] Perform security review
  - [ ] Audit dependencies
  - [ ] Review API key handling

## Discovered During Work
*Tasks discovered during development that weren't initially planned*

- [x] Add a feature to show the last LLM response
  - [x] Implement new CLI flag (`--last`, `-l`)
  - [x] Ensure flag conflicts with profile/extend flags
  - [x] Retrieve and display last assistant message
  - [x] Add unit tests
- [x] Code coloring when outputting to terminal?
  - [x] detect when code blocks start
  - [x] use highlightjs or prismjs to color input
  - [x] do some terminal manip to get it so that the code block gets redrawn after every chunk comes in, so the colors aren't weird from incomplete data
  - [x] automatically disable coloring when no terminal output is detected
- [ ] Add an MCP tool that lets the chat put stuff in the user's clipboard
- [x] refactor to use zod for config validation
- [x] add `--no-stream` option to disable streaming
