# SportClubApp - Progressive Web App

A modern React Progressive Web App (PWA) for sports club management, built with Vite, Tailwind CSS, and optimized for mobile devices.

## ✨ Features

- 🚀 **Progressive Web App (PWA)** - Installable, works offline, and provides native app experience
- 📱 **Mobile-First Design** - Optimized for all device sizes with touch-friendly interfaces
- 🎨 **Modern UI** - Beautiful design with Tailwind CSS and custom skating club theme
- ⚡ **Fast Development** - Powered by Vite for lightning-fast development experience
- 🔧 **Developer-Friendly** - ESLint, Prettier, and TypeScript support
- 🌐 **Offline Support** - Service Worker with intelligent caching strategies
- 📦 **Modern Stack** - React 18, Vite, Tailwind CSS 4.x

## 🛠 Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4.x with custom theme
- **PWA**: vite-plugin-pwa with Workbox
- **Code Quality**: ESLint + Prettier
- **Package Manager**: npm (or bun)

## 📱 PWA Features

- **Installable**: Can be installed from browser on any device
- **Offline Capable**: Works without internet connection
- **App-like Experience**: Full-screen, standalone display mode
- **iOS Optimized**: Safe area support and proper touch targets
- **Responsive**: Works perfectly on mobile, tablet, and desktop

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or bun

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd SportsClubApp
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
bun install
\`\`\`

3. Start the development server:
\`\`\`bash
npm run dev
# or
bun dev
\`\`\`

4. Open your browser and navigate to \`http://localhost:3000\`

## 📁 Project Structure

\`\`\`
src/
├── components/          # Reusable UI components
│   ├── Button.jsx      # Customizable button component
│   ├── Card.jsx        # Card component for content display
│   └── Layout.jsx      # Main layout with navigation
├── pages/              # Main application pages/screens
├── services/           # External service integrations (API calls)
├── hooks/              # Custom React hooks
│   └── usePWA.js      # PWA functionality hook
├── utils/              # Utility functions
│   └── pwa.js         # PWA helper functions
├── contexts/           # React Context providers
├── App.jsx            # Main application component
└── main.jsx           # Application entry point
\`\`\`

## 🎨 Customization

### Theme Colors

The app uses a custom Tailwind theme optimized for sports clubs. Edit \`tailwind.config.js\` to customize:

- **Primary**: Ice blue theme for main actions
- **Secondary**: Gray tones for secondary elements
- **Accent**: Purple highlights
- **Success/Warning/Error**: Semantic colors

### PWA Configuration

Customize PWA settings in \`vite.config.js\`:

- **App Name**: Change manifest name and short_name
- **Icons**: Update icon references and add your icons to \`public/\`
- **Theme Color**: Modify theme_color and background_color
- **Caching**: Adjust Workbox caching strategies

## 📱 Installation Instructions

### Android
1. Open the app in Chrome
2. Tap the menu (⋮) and select "Add to Home screen"
3. Confirm installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Confirm installation

### Desktop
1. Look for the install button in the address bar
2. Click to install the app
3. The app will appear in your applications

## 🔧 Development Scripts

- \`npm run dev\` - Start development server
- \`npm run build\` - Build for production
- \`npm run preview\` - Preview production build
- \`npm run lint\` - Run ESLint
- \`npm run lint:fix\` - Fix ESLint errors
- \`npm run format\` - Format code with Prettier
- \`npm run format:check\` - Check code formatting

## 🏗 Building for Production

1. Build the application:
\`\`\`bash
npm run build
\`\`\`

2. The built files will be in the \`dist/\` directory

3. Preview the production build:
\`\`\`bash
npm run preview
\`\`\`

## 🌐 PWA Testing

To test PWA functionality:

1. Build and serve the app (\`npm run build && npm run preview\`)
2. Open Chrome DevTools > Application > Manifest
3. Test "Add to homescreen" functionality
4. Test offline capabilities in Network tab
5. Verify service worker registration

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (\`git checkout -b feature/amazing-feature\`)
3. Commit your changes (\`git commit -m 'Add some amazing feature'\`)
4. Push to the branch (\`git push origin feature/amazing-feature\`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♀️ Support

For support and questions:
- Open an issue in the repository
- Check the documentation
- Review the code comments for implementation details

---

**Built with ❤️ for the sports club community**