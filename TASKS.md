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
- [ ] Enhance API key management
  - [ ] Implement secure storage of API keys in `.api-keys` file
- [x] Update documentation with configuration instructions

## Phase 4: Testing Framework
*Deliverable: Test suite for existing functionality*

- [x] Add Vitest for testing
- [ ] Write unit tests for core functionality
  - [x] Command-line parsing tests
  - [x] Configuration management tests
  - [ ] LLM connection tests (with mocks)
- [x] Set up test automation

## Phase 5: Enhanced Input Methods
*Deliverable: Support for piped input and file processing*

- [ ] Implement piped input support
  - [ ] Detect and read from stdin when available
  - [ ] Combine piped content with command-line prompt
- [ ] Add Chalk for improved terminal output
- [ ] Update documentation with advanced usage examples
- [ ] Write tests for input functionality

## Phase 6: Interactive Chat Mode
*Deliverable: Interactive chat interface with conversation history*

- [ ] Add interactive chat mode
  - [ ] Implement conversation history tracking
  - [ ] Create interactive prompt interface
  - [ ] Support multi-turn conversations
- [ ] Add verbose mode
  - [ ] Implement token usage tracking
  - [ ] Add response time measurement
  - [ ] Display diagnostics after response
- [ ] Write tests for chat functionality

## Phase 7: Additional LLM Providers
*Deliverable: Support for multiple LLM providers*

- [ ] Add support for OpenAI
- [ ] Add support for AWS Bedrock
- [ ] Add support for OpenRouter
- [ ] Create provider selection mechanism
- [ ] Update documentation with provider-specific instructions

## Phase 8: Polish and Distribution
*Deliverable: Production-ready package published to NPM*

- [ ] Optimize performance
  - [ ] Improve startup time
  - [ ] Enhance streaming performance
- [ ] Implement CI/CD pipeline
  - [x] Set up GitHub Actions for testing
  - [ ] Configure NPM publishing workflow
- [ ] Add support for local MCP servers
- [ ] Create comprehensive documentation
  - [ ] Update README with all features
  - [ ] Add examples for common use cases
  - [ ] Create contribution guidelines
- [ ] Perform security review
  - [ ] Audit dependencies
  - [ ] Review API key handling
- [ ] Prepare for initial release
  - [ ] Finalize version 1.0.0
  - [ ] Publish to NPM

## Discovered During Work
*Tasks discovered during development that weren't initially planned*

- [ ] Code coloring when outputting to terminal?
  - [ ] detect when code blocks start
  - [ ] use highlightjs or prismjs to color input
  - [ ] do some terminal manip to get it so that the code block gets redrawn after every chunk comes in, so the colors aren't weird from incomplete data
  - [ ] add line numbers?
- [ ] Add an MCP tool that lets the chat put stuff in the user's clipboard
