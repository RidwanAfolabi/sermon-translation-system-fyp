
  # Sermon Translation System - React Frontend

Modern React-based frontend for the AI-Driven Malay–English Sermon Translation System.

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Lucide React** - Icons
- **Axios** - API client
- **Sonner** - Toast notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://127.0.0.1:8000`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
frontend-react/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Layout components (Sidebar, Header)
│   │   ├── ui/          # Base UI components (Button, Card, etc.)
│   │   └── figma/       # Figma-exported components
│   ├── pages/           # Page components
│   ├── context/         # React context providers
│   ├── services/        # API and WebSocket services
│   ├── config/          # Configuration files
│   ├── styles/          # Global styles
│   └── App.tsx          # Main application
├── public/              # Static assets
└── index.html           # Entry HTML
```

## Features

- 🔐 **Authentication** - Login with role-based access
- 📊 **Dashboard** - Overview of sermon statistics
- 📤 **Upload** - Upload sermon scripts with auto-segmentation
- 📚 **Library** - Browse and manage sermons
- ✏️ **Segment Editor** - Edit translations with confidence scores
- ✅ **Vetting Queue** - Scholar review workflow
- 📺 **Live Display** - Real-time subtitle display
- 🎛️ **Control Room** - Operator view for live sessions
- 📈 **Analytics** - Performance metrics

## Environment Variables

Create a `.env` file:

```env
VITE_API_URL=http://127.0.0.1:8000
VITE_WS_URL=ws://127.0.0.1:8000
```

## API Integration

The frontend connects to the FastAPI backend:

- REST API: Sermon CRUD, translation, segment management
- WebSocket: Live subtitle streaming

## Development

```bash
# Start dev server with hot reload
npm run dev

# Type checking
npx tsc --noEmit

# Build
npm run build
```
  