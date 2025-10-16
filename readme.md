# DOCLIN NOTE GENERATOR

Doclin Note Generator is an AI-powered platform for generating notes, question papers, and study guides. It is designed for students, teachers, and professionals to simplify the process of creating educational content, allowing users to focus on learning and teaching rather than manual preparation.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
  - [Frontend](#frontend-tech-stack)
  - [Backend](#backend-tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Installation](#installation)
  - [Running the Project](#running-the-project)
  - [Docker Usage](#docker-usage)
- [Development](#development)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Features

- **AI Question Generator:** Generate contextual questions from any topic using advanced AI algorithms.
- **Smart Notes:** Create organized, searchable notes with automatic formatting and categorization.
- **Study Materials:** Transform your content into comprehensive study guides and flashcards.
- **Progress Analytics:** Track your learning journey with detailed analytics and insights.
- **Exam Paper Generation:** Generate exam papers for various boards (CBSE, ICSE, Custom) with customizable configuration.
- **User Authentication:** Secure login, registration, and OAuth (Google, Meta) support.
- **Admin Dashboard:** Manage users, models, and syllabus.
- **Feedback & Issue Reporting:** Users can submit feedback and report issues with attachments.
- **Responsive UI:** Modern, mobile-friendly interface with smooth animations.

---

## Tech Stack

### Frontend Tech Stack

- **React.js** – UI library for building user interfaces.
- **TypeScript** – Type-safe JavaScript.
- **Framer Motion** – Animation library for React.
- **Zod** – TypeScript-first schema validation.
- **TanStack Router** – Powerful, type-safe routing for React.
- **TanStack Query** – Data fetching and caching.
- **Radix UI** – Accessible, customizable UI primitives.
- **React Icons** – Popular icon packs for React.
- **Next-themes** – Theme switching for React.
- **Sonner** – Customizable toast notifications.
- **Shadcn** – Reusable React component library.
- **TailwindCSS** – Utility-first CSS framework.
- **Vite** – Fast frontend build tool.
- **Docker** – Containerization for development and deployment.

### Backend Tech Stack

- **FastAPI** – High-performance Python web framework.
- **SQLAlchemy** – ORM for database management.
- **Alembic** – Database migrations.
- **PostgreSQL** – Relational database.
- **Pydantic** – Data validation and settings management.
- **Authlib** – OAuth & JWT handling.
- **python-jose** – JWT authentication.
- **passlib/bcrypt** – Password hashing.
- **httpx** – Async HTTP client.
- **pdfplumber** – PDF parsing.
- **Cohere, Google GenAI, LangChain** – AI/LLM integrations.
- **Docker** – Containerization for backend services.

---

## Project Structure

```
apps/
  backend/
    src/
      config/         # Configuration and settings
      core/           # Core entities, services, templates, repo interfaces
      database/       # Database setup and models
      infrastructure/ # Concrete repo implementations, providers, models
      interfaces/     # API routes, schemas, dependencies
      LLMs/           # LLM integration logic
      prompts/        # Prompt templates for LLMs
      utils/          # Utility functions and middleware
    requirements.txt
    requirements-prod.txt
    .env
    .example.env
    main.py
  frontend/
    src/
      components/     # React components (pages, UI, dashboard, etc.)
      context/        # React context providers
      hook/           # Custom React hooks
      layouts/        # Layout components
      lib/            # Utility libraries (data, motion, auth, etc.)
      routes/         # Route definitions (TanStack Router)
      types/          # TypeScript types and schemas
      utils/          # Utility functions/constants
    index.html
    vite.config.ts
    .env
    .env.example
    package.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [pnpm](https://pnpm.io/) (or npm/yarn)
- [Python](https://www.python.org/) (3.10+ recommended)
- [PostgreSQL](https://www.postgresql.org/) (if running locally)
- [Docker](https://www.docker.com/) (optional, for containerized setup)

### Environment Variables

#### Backend

Copy `.example.env` to `.env` in `apps/backend/` and fill in the required values.

#### Frontend

Copy `.env.example` to `.env` in `apps/frontend/` and set the API base URL and OAuth credentials.

### Installation

#### Backend

```sh
cd apps/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Frontend

```sh
cd apps/frontend
pnpm install  # or npm install / yarn install
```

### Running the Project

#### Backend

```sh
cd apps/backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```sh
cd apps/frontend
pnpm dev  # or npm run dev / yarn dev
```

The frontend will be available at [http://localhost:5173](http://localhost:5173) and the backend at [http://localhost:8000](http://localhost:8000).

### Docker Usage

You can use Docker Compose for a full-stack setup (backend, frontend, and PostgreSQL):

```sh
docker-compose up --build
```

- The backend will run on port 8000.
- The frontend will run on port 5173.
- PostgreSQL will be available as configured in `docker-compose.yml`.

---

## Development

- **Hot Reloading:** Both frontend and backend support hot reloading for rapid development.
- **Code Quality:** ESLint and Prettier are recommended for code formatting and linting.
- **Type Safety:** TypeScript and Zod schemas are used throughout the frontend for type safety.

---

## Testing

- **Frontend:** Add and run tests using your preferred React testing library (e.g., Jest, React Testing Library).
- **Backend:** Use `pytest` for Python backend tests.

---

## Deployment

- **Frontend:** Build with `pnpm build` and deploy the `dist/` folder to your preferred static hosting (Vercel, Netlify, etc.).
- **Backend:** Deploy using Docker, or any cloud provider supporting FastAPI (e.g., Azure, AWS, Heroku).

---

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add your message"`
4. Push to your fork: `git push origin feature/your-feature-name`
5. Open a Pull Request describing your changes.

**Guidelines:**
- Write clear, concise commit messages.
- Follow the existing code style.
- Add tests for new features.
- Document your code and update the README if necessary.

---

## License

This project is licensed under the MIT License.

---

## Acknowledgements

- [React](https://react.dev/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [TanStack](https://tanstack.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Zod](https://zod.dev/)
- [Radix UI](https://www.radix-ui.com/)
- [Sonner](https://sonner.emilkowal.ski/)
- [Shadcn](https://ui.shadcn.com/)
- [Cohere](https://cohere.com/)
- [Google GenAI](https://ai.google.dev/)
- [LangChain](https://www.langchain.com/)

---

For any questions, issues, or feature requests, please use the [Contact](./apps/frontend/src/components/pages/ContactPage.tsx) page or open an issue on GitHub.
