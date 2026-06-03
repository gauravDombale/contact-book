# ContactBook

A personal contact book with full CRUD, search, and merge. Built with FastAPI, SQLite, SQLAlchemy 2.0 async, React 18, Vite, Tailwind CSS v3, Zustand, and Axios.

## Requirements

- Docker and Docker Compose
- Or Python 3.11+ and Node 24 LTS+

## Quick Start with Docker

```bash
docker compose up --build
```

Open http://localhost:3000.

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API: http://localhost:8000

Swagger UI: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

UI: http://localhost:5173

## Run Tests

```bash
cd backend
pytest tests/ -v
```

## Features

- Add and edit contacts with name, phone, email, company, address, and notes
- Search by name, phone, or email with debounced live search
- Delete contacts with a confirmation dialog
- Merge two contacts with a target-wins, source-fills-empty-fields strategy
- REST API with OpenAPI docs
- Alembic migration scaffold
- Docker one-command deployment

## API Endpoints

- `GET /health`
- `GET /api/v1/contacts/`
- `POST /api/v1/contacts/`
- `GET /api/v1/contacts/search?q=alice`
- `GET /api/v1/contacts/{contact_id}`
- `PUT /api/v1/contacts/{contact_id}`
- `DELETE /api/v1/contacts/{contact_id}`
- `POST /api/v1/contacts/merge`
