# Contributing to ByTamilan Community

We love your input! We want to make contributing to BytaTamilan Community as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Prerequisites

- Node.js 18+ 
- pnpm (we use pnpm as our package manager)
- Supabase account (for local development)

### Setting Up Local Development

1. Fork the repository and clone it locally:
```bash
git clone https://github.com/byTamilan/community.git
cd community
```

2. Install dependencies:
```bash
pnpm install
```

3. Create a `.env.local` file in the root directory (see `.env.example` for required variables)

4. Set up your local Supabase instance:
   - Create a new project in Supabase
   - Copy the project URL and anon key from your project settings
   - Update your `.env.local` file with these values

5. Run database migrations:
```bash
pnpm prisma migrate dev
```

6. Start the development server:
```bash
pnpm dev
```

The app should now be running at http://localhost:3000

### Development Workflow

1. Create a new branch for your feature/fix:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and test them:
```bash
pnpm test        # Run tests
pnpm lint        # Run linter
```

3. Commit your changes:
```bash
git commit -m "feat: add your feature description"
```

We follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

4. Push to your fork and submit a pull request

### Code Style

- We use ESLint and TypeScript for code consistency
- Follow the existing code style and patterns
- Write meaningful commit messages following Conventional Commits
- Include tests for new features
- Update documentation as needed

### Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the documentation if you're changing any APIs
3. Make sure your code passes all tests and lint checks
4. The PR will be merged once you have the sign-off of at least one maintainer

## Community Guidelines

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## Questions?

Feel free to open an issue or reach out to the maintainers if you have any questions.