# AscendFit - AI-Powered Fitness Platform

Transform your fitness journey with AI-powered video analysis, personalized workout plans, and custom nutrition guidance.

**URL**: https://lovable.dev/projects/511b5c10-bedf-453c-b2aa-e03b1346b5bb

## 🚀 Features

### Core Features
- **AI Video Analysis**: Upload workout videos for detailed form, posture, and technique feedback
- **Real-time Posture Analysis**: Live camera analysis during workouts with instant feedback
- **Personalized Workout Planning**: AI-generated custom workout schedules based on your goals
- **Custom Diet Planning**: Personalized nutrition plans tailored to fitness goals and dietary restrictions
- **Progress Tracking**: Visual representation of your fitness journey with detailed metrics
- **AI Workout Assistant**: Real-time guidance and motivation during workout sessions
- **Gamification**: Interactive achievements, badges, and milestone celebrations

### Technical Features
- **Progressive Web App**: Install on mobile devices for app-like experience
- **Offline Support**: Continue tracking workouts even without internet connection
- **Responsive Design**: Optimized for all screen sizes and devices
- **Real-time Updates**: Live data synchronization across all your devices
- **Secure Authentication**: Protected user data with row-level security

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI (shadcn/ui)
- **Backend**: Supabase (Database, Auth, Storage, Edge Functions)
- **AI Integration**: 
  - Google Gemini API (video analysis, posture detection)
  - Lovable AI Gateway (workout planning, meal planning, chat assistant)
- **State Management**: React Query, Context API
- **Routing**: React Router v6

## 📋 Prerequisites

- Node.js 18+ (install with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase account (for backend services)
- Modern web browser with camera support (for real-time analysis)

## 🚦 Getting Started

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev
```

The app will be available at [http://localhost:8080](http://localhost:8080)

### Environment Setup

The project is already configured with Supabase. No additional environment variables are needed as they are managed by Lovable.

## 📝 How to Edit This Project

### Use Lovable (Recommended)

Simply visit the [Lovable Project](https://lovable.dev/projects/511b5c10-bedf-453c-b2aa-e03b1346b5bb) and start prompting. Changes made via Lovable will be committed automatically to this repo.

### Use Your Preferred IDE

Clone this repo and push changes. Pushed changes will also be reflected in Lovable.

### Edit Directly in GitHub

- Navigate to the desired file(s)
- Click the "Edit" button (pencil icon)
- Make your changes and commit

### Use GitHub Codespaces

- Click on the "Code" button
- Select the "Codespaces" tab
- Click "New codespace"

## 🏗️ Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── assistant/   # AI assistant components
│   ├── auth/        # Authentication components
│   ├── dashboard/   # Dashboard widgets
│   ├── layout/      # Layout components
│   ├── progress/    # Progress tracking components
│   ├── ui/          # Base UI components (shadcn/ui)
│   ├── video/       # Video analysis components
│   └── workout/     # Workout-related components
├── contexts/        # React context providers
├── hooks/           # Custom React hooks
├── integrations/    # Third-party integrations (Supabase)
├── lib/            # Utility functions and helpers
├── pages/          # Page components
└── types/          # TypeScript type definitions

supabase/
├── functions/      # Edge functions for backend logic
└── migrations/     # Database migrations

public/
├── manifest.json   # PWA manifest
└── sw.js          # Service worker
```

## 🔒 Security

### Authentication
- Email/password authentication via Supabase Auth
- Protected routes with authentication guards
- Session management with automatic token refresh

### Data Privacy
- Row-Level Security (RLS) policies on all database tables
- User data isolated by user ID
- Secure file storage with access control
- HTTPS-only in production

## 📱 Progressive Web App (PWA)

AscendFit is a Progressive Web App that can be installed on your device:

1. Open the app in a supported browser
2. Look for the "Install" prompt or menu option
3. Follow the installation instructions
4. Launch from your home screen like a native app

### PWA Features
- Offline workout tracking
- Background data sync
- App-like navigation
- Fast loading with service worker caching

## 🚀 Deployment

### Deploy with Lovable

Simply open [Lovable](https://lovable.dev/projects/511b5c10-bedf-453c-b2aa-e03b1346b5bb) and click on Share -> Publish.

### Custom Domain

To connect a custom domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)

## 📊 Performance Optimization

### Implemented Optimizations
- Code splitting by route and vendor chunks
- Lazy loading of heavy components
- Service worker caching
- Debounced inputs
- Optimized bundle size
- Error boundaries for graceful error handling

### Monitoring
- Performance monitoring in development mode
- Error tracking with detailed logs
- Network status detection

## ♿ Accessibility

### WCAG 2.1 Compliance
- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios meet standards
- Focus indicators on all interactive elements

## 🆘 Support

For issues or questions:
- Check the [Lovable Documentation](https://docs.lovable.dev/)
- Join the [Lovable Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
- Review the [troubleshooting guide](https://docs.lovable.dev/tips-tricks/troubleshooting)

## 🔄 Version History

### v1.0.0 (Current)
- ✅ Core UI and layout
- ✅ Authentication system
- ✅ Database schema and RLS policies
- ✅ AI video analysis
- ✅ Workout and meal plan generation
- ✅ AI chat assistant
- ✅ Progress tracking
- ✅ PWA features
- ✅ Performance optimization
- ✅ Accessibility improvements
- ✅ Error handling and monitoring

---

Built with ❤️ using [Lovable](https://lovable.dev)
