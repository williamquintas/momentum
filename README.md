# Momentum

[![CI](https://github.com/williamquintas/momentum/workflows/CI/badge.svg)](https://github.com/williamquintas/momentum/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/williamquintas/momentum)

Momentum is a comprehensive goals tracking management system built with React, TypeScript, and Ant Design. This system provides users with clear visibility into their objectives, progress, and achievements through flexible tracking mechanisms and rich visualization capabilities.

## 🎯 Features

### Multiple Goal Types

- **Quantitative Goals**: Track numeric targets with progress bars and percentage completion
- **Qualitative Goals**: Monitor descriptive achievements with milestone checkpoints
- **Binary/Checkbox Goals**: Simple done/not-done tracking with count-based progress
- **Milestone-Based Goals**: Break large goals into smaller, trackable milestones
- **Recurring Goals**: Track goals that repeat on schedules (daily, weekly, monthly)
- **Habit Goals**: Build consistent behaviors with streak counters and calendar heatmaps
- **Time-Bound Goals**: Goals with specific deadlines and countdown timers

### Key Capabilities

- 📊 **Dashboard Overview**: Immediate insight into overall goal performance
- 📋 **Goal List View**: Comprehensive list with filtering, sorting, and search
- 📈 **Progress Tracking**: Visual progress indicators and completion metrics
- 🏷️ **Categorization**: Organize goals by categories and tags
- 🔔 **Notifications**: Alerts for upcoming deadlines and overdue goals
- 📱 **Responsive Design**: Works seamlessly on mobile, tablet, and desktop
- ♿ **Accessible**: Built with accessibility best practices

## 🛠️ Technology Stack

- **Frontend Framework**: React with TypeScript
- **UI Library**: Ant Design (antd)
- **State Management**: Redux Toolkit or Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Styling**: Ant Design theme customization, CSS-in-JS if needed
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn package manager
- Git

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd momentum
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your configuration
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:5173](http://localhost:5173) in your browser (Vite default port)

> **Note**: The default port for Vite is 5173, not 3000. Check your terminal output for the actual port.

## 📁 Project Structure

```
src/
  components/          # Reusable UI components
    common/            # Shared components
    goal/              # Goal-specific components
  features/            # Feature-based modules
    goals/             # Goal management feature
      components/      # Feature-specific components
      hooks/           # Feature-specific hooks
      services/        # API calls
      types/           # TypeScript types
      utils/           # Helper functions
  pages/               # Page-level components
  hooks/               # Global custom hooks
  store/               # State management
  services/            # API services
  types/               # Global TypeScript types
  utils/               # Global utilities
  constants/           # Constants and enums
```

## 📚 Documentation

### Development Guidelines

This project includes comprehensive development guidelines organized in the `.cursor/rules/` directory:

- **[Code Standards](./.cursor/rules/code-standards.md)** - TypeScript, React patterns, naming conventions
- **[Architecture](./.cursor/rules/architecture.md)** - System and component architecture
- **[UI Component Guidelines](./.cursor/rules/ui-component-guidelines.md)** - Component development and Ant Design usage
- **[State Management](./.cursor/rules/state-management.md)** - State management patterns
- **[API & Data Handling](./.cursor/rules/api-data-handling.md)** - API service patterns
- **[Error Handling](./.cursor/rules/error-handling.md)** - Error handling strategies
- **[Testing](./.cursor/rules/testing.md)** - Testing guidelines
- **[Performance Optimization](./.cursor/rules/performance-optimization.md)** - Performance best practices
- **[Accessibility](./.cursor/rules/accessibility.md)** - Accessibility guidelines
- **[Security](./.cursor/rules/security.md)** - Security best practices

For a complete list of all development guidelines, see [AGENTS.md](./AGENTS.md).

### System Planning

For detailed system requirements and planning, see [GOALS_TRACKING_SYSTEM_PLAN.md](./GOALS_TRACKING_SYSTEM_PLAN.md).

### UI Mockups

UI mockups and design references are available in the [docs/mockups](./docs/mockups/) directory:

- **[Dashboard Mockup](./docs/mockups/dashboard-mockup.md)** - Comprehensive dashboard interface mockup with four panel views

## 🧪 Development

### Key Principles

- **Type-safe development** with TypeScript
- **Component-based architecture** for reusability
- **Responsive and accessible design** for all users
- **Performance-optimized rendering** for smooth UX
- **Consistent use of Ant Design patterns** for UI consistency

### Available Scripts

```bash
# Development
npm run dev          # Start development server

# Building
npm run build        # Build for production

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript type checking
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details on:

- How to set up your development environment
- Code style and standards
- How to submit pull requests
- Testing requirements
- Commit message conventions

Before contributing, please read our [Code of Conduct](./CODE_OF_CONDUCT.md).

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting (`npm run validate`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.

## 👥 Contributors

Thank you to all the wonderful people who have contributed to this project!

See [CONTRIBUTORS.md](./CONTRIBUTORS.md) for the full list of contributors.

## 💬 Support

Need help? Here are some ways to get support:

- 📚 **Documentation**: Check our [README](./README.md) and [Contributing Guide](./CONTRIBUTING.md)
- 💬 **Discussions**: Ask questions in [GitHub Discussions](https://github.com/williamquintas/momentum/discussions)
- 🐛 **Bug Reports**: Report bugs using the [bug report template](https://github.com/williamquintas/momentum/issues/new?template=bug_report.md)
- ✨ **Feature Requests**: Suggest features using the [feature request template](https://github.com/williamquintas/momentum/issues/new?template=feature_request.md)
- 📖 **Support Guide**: See [.github/SUPPORT.md](.github/SUPPORT.md) for more information

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 📦 Demo

<!-- Add live demo link when available -->

🚀 **Live Demo**: Coming soon!

<!-- Add screenshots/GIFs when available -->

### Screenshots

<!-- Add screenshots here -->

- Dashboard view
- Goal list view
- Goal detail view

## 🔗 Links

- [System Planning Document](./GOALS_TRACKING_SYSTEM_PLAN.md)
- [Development Guidelines Index](./AGENTS.md)
- [Version Management Guide](./docs/VERSION_MANAGEMENT.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Changelog](./CHANGELOG.md)
- [Ant Design Documentation](https://ant.design/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

Built with ❤️ and ☕️ using React, TypeScript, and Ant Design
