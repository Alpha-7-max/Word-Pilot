# Word Pilot

A modern web application that provides intelligent text translation between English and Roman Urdu, along with prompt enhancement capabilities. Built with React and TypeScript, featuring a clean and intuitive user interface powered by Gemini AI.

## Features

- **Multi-mode Translation**: Translate between English and Roman Urdu
- **Prompt Enhancement**: Improve and polish prompts for better AI responses
- **Untranslatable Word Highlighting**: Clearly marks words that cannot be translated
- **Real-time Processing**: Instant translation and enhancement feedback
- **One-click Copy**: Easily copy results to clipboard
- **Modern UI**: Clean, responsive interface with loading states
- **Gemini AI Powered**: Leverages Google's latest AI technology

## Tech Stack

- **Frontend Framework**: React with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Build Tool**: Vite
- **Language Support**: English and Roman Urdu

## Open Source

This project is open-source and created by 7-MAX. You can use, modify, and integrate it into your systems without any restrictions or licensing requirements.

## API Key Setup

To use this application, you'll need to:
1. Obtain your own Gemini API key from Google AI Studio
2. Replace the placeholder in `textcorrectorservices.tsx` with your API key

## Contributing

If you'd like to contribute to this project or give credit to the original author:
- Contact: azeemali25693@gmail.com
- Contributions are welcome via pull requests

## Getting Started

### Prerequisites

- Node.js & npm - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Clone the repository
git clone https://github.com/Alpha-7-max/Word-Pilot.git

# Navigate to the project directory
cd Word-Pilot

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Usage

1. Select your target mode (English, Roman Urdu, or Prompt Enhance)
2. Type or paste your text in the input area
3. Click the Translate/Enhance button
4. View the processed text in the output area
5. Use the copy button to save the result to your clipboard

For prompt enhancement:
- The system will expand and improve your prompts for better AI responses
- Works best with clear initial instructions that need refinement

## Development

```sh
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
  ├── components/     # React components
  ├── services/       # Translation services
  ├── hooks/          # Custom React hooks
  ├── lib/            # Utility functions
  └── pages/          # Page components
```
