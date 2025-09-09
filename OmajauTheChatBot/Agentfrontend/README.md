# Next.js Frontend for AI Chat Assistant

This is the frontend application for the AI Chat Assistant, built with Next.js 14 and connected to a Flask backend.

## Features

- 🎨 Modern, responsive UI with dark/light theme support
- 💬 Real-time chat interface with AI responses
- 🔄 Backend status monitoring
- 📱 Mobile-friendly design
- 🎯 Easy navigation between pages

## Backend Connection

The frontend connects to a Flask backend running on `http://localhost:5000` with the following endpoints:

- `POST /chat` - Send chat messages and receive AI responses
- `GET /history/<session_id>` - Retrieve conversation history
- `GET /health` - Check backend health status

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- Flask backend running on port 5000
- MongoDB running (for the backend)

### Installation

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   # or
   pnpm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
frontend/
├── app/                    # Next.js 14 app directory
│   ├── page.tsx          # Home page
│   ├── chat/             # Chat page
│   │   └── page.tsx      # Chat interface
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── chat-interface.tsx    # Main chat component
│   ├── backend-status.tsx    # Backend connection status
│   ├── navigation.tsx        # Navigation menu
│   ├── mic-search-bar.tsx    # Voice input component
│   └── ui/                   # Shadcn/ui components
├── lib/                  # Utility functions
│   ├── api.ts            # API communication functions
│   └── utils.ts          # General utilities
└── styles/               # Global styles
```

## API Integration

The frontend communicates with the Flask backend through the `lib/api.ts` file, which provides:

- `sendChatMessage()` - Send messages to the chat endpoint
- `getConversationHistory()` - Retrieve conversation history
- `checkHealth()` - Monitor backend health

## CORS Configuration

The Flask backend has CORS enabled to allow requests from the Next.js frontend. The frontend makes requests to `http://localhost:5000` and the backend accepts them.

## Session Management

Each chat session gets a unique session ID generated on the client side. This ID is used to:
- Track conversation history
- Maintain context across page refreshes
- Store messages in the backend database

## Error Handling

The frontend includes comprehensive error handling for:
- Network connectivity issues
- Backend service errors
- Invalid API responses
- User input validation

## Development

### Adding New Features

1. Create new components in the `components/` directory
2. Add new API functions to `lib/api.ts`
3. Update the navigation in `components/navigation.tsx`
4. Test with the running Flask backend

### Styling

The project uses:
- Tailwind CSS for styling
- Shadcn/ui for component library
- CSS modules for component-specific styles

### State Management

- React hooks for local state
- No external state management libraries
- Session storage for persistence

## Troubleshooting

### Backend Connection Issues

1. Ensure Flask backend is running on port 5000
2. Check the backend status indicator in the header
3. Verify MongoDB is running and accessible
4. Check browser console for CORS errors

### Common Issues

- **CORS errors**: Ensure Flask-CORS is properly configured
- **Network errors**: Check if backend is accessible at localhost:5000
- **MongoDB errors**: Verify MongoDB connection in backend logs

## Deployment

For production deployment:

1. Update `lib/api.ts` with production backend URL
2. Build the application: `npm run build`
3. Deploy the `out/` directory to your hosting service
4. Ensure CORS is configured for your production domain
