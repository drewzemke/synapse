# CHAT_FEATURE.md

## Phase 1: Basic Interactive Chat Loop
*Deliverable: Minimal functional chat mode with simple input/output cycle*

- [x] Create new module `src/cli/chat.ts` with core components:
  - [x] `startChatSession(initialPrompt?: string, extendConversation: boolean = false)`: Main function that initiates the chat loop
  - [x] Use Node.js built-in `readline` module for input handling
  - [x] Leverage existing conversation management from `src/conversation/`
  - [x] Support proper exit with CTRL+C

- [x] Update `src/index.ts` to integrate chat mode:
  - [x] Modify the branch that handles `args.chat` to call the new chat module
  - [x] Pass through initial prompt if provided via CLI arguments
  - [x] Pass the `-e` flag status to continue previous conversations

- [x] Implementation details:
  - [x] No additional libraries needed (using built-in `readline`)
  - [x] Use the existing LLM streaming for real-time responses 
  - [x] Use the existing conversation storage for saving chat history

## Phase 2: Enhanced User Experience
*Deliverable: Visually improved chat interface with clear user/assistant distinction*

- [x] Enhance `src/cli/chat.ts` with visual improvements:
  - [x] Add colored prompt symbol ("⟫⟫⟫ ") in color using chalk
  - [x] Maintain clear visual separation between chat turns with additional newlines
  - [x] Display streaming responses using existing streaming functionality

- [x] Add session management:
  - [x] Save conversation after each chat turn
    - [ ] bug: sometimes conversation is continued even when I haven't passed `-e`
  - [ ] Properly handle interrupts to ensure conversation state is preserved

- [ ] add README section that explains feature in depth

## Phase 3: Integration with Configuration
*Deliverable: Chat mode that respects user profiles and settings*

- Ensure chat module respects user configuration:
  - [ ] Honor selected profile (`-p/--profile`) in chat sessions
  - [ ] Honor selected model (`-m/--model`) in chat sessions
  - [ ] Apply color configuration for code blocks in responses
  - [ ] Support verbose mode in chat to show token usage after each response

- [ ] Add proper conversation state display:
  - [ ] Show visual indicator when continuing a conversation
  - [ ] Display message count when continuing conversations
  - [ ] Ensure configuration choices are persistent throughout chat session

## Phase 4: Add Commands
(needs expanding)

I want to add:
  - `/exit` - quit
  - `/verbose` - toggle verbose mode
  - `/convo` - view entire convo so far
  - `/clear` - start new convo
  - `/copy` - copy last response to clipboard
maybe these too
  - `/profile` - set profile mid convo

## Implementation Notes

### Key Files to Modify:
- `src/cli/args.ts`: Ensure chat flag is properly documented
- `src/index.ts`: Update main flow to handle chat mode
- `src/cli/chat.ts` (new): Implement interactive chat functionality
- `src/conversation/storage.ts`: Ensure robust conversation saving for interactive mode

### Integration Points:
- Use existing `loadLastConversation()` and `saveConversation()` for state management
- Leverage existing `streamWithCodeColor()` for response formatting
- Use the same LLM interface (`createLLMFromEnv()`) to maintain consistency

### Dependencies:
- No new external dependencies required, using Node.js built-in `readline`
- Leverage existing utilities for coloring, configuration, and LLM interaction
