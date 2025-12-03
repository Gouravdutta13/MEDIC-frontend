# MEDIC - AI Medical Assistant

A production-ready, ultra-premium medical chatbot frontend built with Next.js, TypeScript, TailwindCSS, shadcn/ui, and Framer Motion.

## Features

### Core Chat
- Full-height chat window with auto-scroll and grouped messages
- Token-by-token streaming rendering (mock implementation)
- Markdown rendering with headings, lists, links, and code blocks
- Inline citations and source cards for RAG
- "MEDIC is thinking..." typing indicator
- Quick follow-up suggestion chips
- Message actions: copy, share, export, flag, save

### Voice Assistant
- Speech-to-Text (Web Speech API)
- Text-to-Speech (SpeechSynthesis)
- Language selection and playback speed controls
- Visual waveform indicator while recording
- Browser fallback handling

### Theme & Accessibility
- Night mode (default) + Light mode
- Theme toggle shortcut (Ctrl/Cmd + J)
- High-contrast mode (WCAG AA)
- Fully keyboard navigable
- Screen reader friendly (ARIA labels, roles)

### Command Palette
- Open with Ctrl/Cmd + K
- Quick actions for tools, theme, export, settings
- Keyboard navigation with fuzzy search

### Medical Tools
- Symptom Analyzer with body region selection
- Drug Lookup with interactions and warnings
- First Aid Guide with step-by-step instructions
- Health Reports generator
- Emergency Info with quick-dial contacts

### Security & Safety
- Medical disclaimers throughout
- Flag/report flow for problematic answers
- Confidence indicators for uncertain responses

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
\`\`\`

## Project Structure

\`\`\`
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main entry point
│   └── globals.css         # Design tokens and utilities
├── components/
│   ├── chat/
│   │   ├── chat-page.tsx   # Main chat orchestrator
│   │   ├── chat-window.tsx # Message list and streaming
│   │   ├── chat-input.tsx  # Message input with voice
│   │   ├── chat-message.tsx # Individual message rendering
│   │   ├── typing-indicator.tsx
│   │   └── message-actions.tsx
│   ├── tools/
│   │   ├── symptom-analyzer.tsx
│   │   ├── drug-lookup.tsx
│   │   ├── first-aid-guide.tsx
│   │   ├── health-reports.tsx
│   │   └── emergency-info.tsx
│   └── ui/
│       ├── app-sidebar.tsx
│       ├── navbar.tsx
│       ├── command-palette.tsx
│       ├── loading-screen.tsx
│       └── settings-modal.tsx
└── lib/
    ├── api.ts              # Mock streaming & API helpers
    ├── voice.ts            # STT/TTS utilities
    ├── storage.ts          # localStorage helpers
    └── types.ts            # TypeScript definitions
\`\`\`

## Backend Integration

Replace the mock functions in `lib/api.ts` with real API calls:

\`\`\`typescript
// Example: Real SSE streaming
export async function* streamResponse(query: string) {
  const response = await fetch('/api/chat', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
  
  const reader = response.body?.getReader();
  // Process SSE stream...
}
\`\`\`

## Testing Suggestions

\`\`\`bash
# Unit tests with React Testing Library
npm test

# Components to test:
# - ChatInput: Enter/Shift+Enter behavior, voice toggle
# - CommandPalette: keyboard navigation, fuzzy search
# - Voice helpers: STT/TTS API availability
\`\`\`

## Performance Tips

- Use dynamic imports for heavy components
- Implement virtualization for long chat histories
- Optimize images with next/image
- Consider edge caching for static assets

## Linting & Formatting

\`\`\`bash
# ESLint
npm run lint

# Prettier
npm run format
\`\`\`

## Design Tokens

| Token | Value |
|-------|-------|
| Background | #071022 (deep navy) |
| Primary | #08E5D8 (cyan) |
| Secondary | #1396FF (blue) |
| Accent | #1CD4D4 |
| Destructive | #FF5A5F |
| Text Primary | #E6F0F6 |
| Text Muted | #9AA5B2 |

## Theme Variations

- **Default**: Cyan-blue gradient (professional)
- **Clinical Minimal**: Colder blue tones
- **Warm Care**: Beige/amber accents

## License

MIT License - See LICENSE file for details.

---

Built with care for healthcare accessibility.
