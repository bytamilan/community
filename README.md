# BytaTamilan Community

A community discussion platform built with Next.js and Supabase, focused on fostering Tamil tech discussions and knowledge sharing.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Sponsor](https://img.shields.io/badge/Sponsor-Support%20Us-blue)](https://github.com/sponsors/byTamilan)

## 🚀 Features

- Next.js 13+ with App Router
- Supabase for Authentication and Database
- TypeScript for type safety
- TailwindCSS for styling
- Prisma as ORM
- i18n support (English & Tamil)
- Dark/Light mode
- Real-time notifications
- Docker support for local development

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Supabase account
- Docker (optional)

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/bytaTamilan/community.git
cd community
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Edit `.env.local` with your Supabase credentials and other required variables.

4. Start the development server:
```bash
pnpm dev
```

### Docker Development

1. Build and run with Docker Compose:
```bash
docker-compose up --build
```

The application will be available at http://localhost:3000

## Deployment Options

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use [Vercel](https://vercel.com/new?utm_medium=default-template&filter=next.js).

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FbytaTamilan%2Fcommunity)

### Deploy with Docker

1. Build the Docker image:
```bash
docker build -t bytatamilan-community .
```

2. Run the container:
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  bytatamilan-community
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## Support the Project

If you find this project helpful, please consider:

- [Starring the repository ⭐](https://github.com/bytaTamilan/community)
- [Becoming a sponsor 💖](https://github.com/sponsors/bytaTamilan)
- [Contributing to the code 👨‍💻](CONTRIBUTING.md)

### Sponsors

[![Sponsor the project](https://img.shields.io/badge/Sponsor-Support%20Us-blue)](https://github.com/sponsors/bytaTamilan)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
