# CivicPulse Delhi: Smart Public Service CRM (PS-CRM)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Appwrite](https://img.shields.io/badge/BaaS-Appwrite-f02e65?style=for-the-badge&logo=appwrite&logoColor=white)](https://appwrite.io)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

CivicPulse Delhi is a multi-portal civic grievance platform for transparent issue reporting, assignment, SLA tracking, and proof-based resolution across citizen, admin, manager, and worker flows.

## What's New In This Build

- Multi-role portal routing with protected role-based access.
- AI assistant endpoints for citizen, manager, and worker guidance.
- Smart worker recommendation endpoint for assignment support.
- Priority scoring and SLA-by-category logic integrated in complaint workflows.
- Manager workload-aware assignment flow (least active complaints strategy).
- Admin queue with SLA-risk and priority visibility.
- Admin analytics module with Delhi zone heatmap and operational KPI views.
- Leaderboard APIs with impact scoring and verification-based points.
- Worker APIs with active task counts derived from live complaint status.

## Multi-Portal Feature Snapshot

### Citizen Portal

- Report issue with category, description, location, and media.
- Personal complaint history and complaint detail timeline.
- Escalation and feedback flow on complaint lifecycle.
- Community leaderboard participation.

### Admin Portal

- Admin overview for operations monitoring.
- Queue operations with filtering, priority, and SLA context.
- Analytics and heatmap view for city-level trend analysis.
- SLA management, user management, and manager operations screens.

### Manager Portal

- Manager-level complaint monitoring and action dashboard.
- Worker management and assignment controls.
- Priority-aware complaint decision support.

### Worker Portal

- Worker task dashboard and resolved work history views.
- Profile and workflow status update screens.
- Resolution execution flow aligned with proof-based closure model.

## Core Implementation Highlights

- Complaint APIs include listing, creation, assignment, status updates, and share-card update support.
- Location handling includes reverse geocoding and address-based state extraction safeguards.
- SLA matrix and category-priority scoring are centralized in backend complaint logic.
- AI chat and assignment intelligence are exposed under dedicated backend routes.
- Leaderboard scoring includes reporter impact and verification contributions.
- Keep-alive and scheduled background jobs are started with backend app startup.

## Tech Stack

- Frontend: React 18, Vite, TypeScript, Tailwind CSS.
- Backend: FastAPI, Pydantic, Appwrite Python SDK.
- AI Integration: Groq chat completion APIs.
- Data/Storage: Appwrite Databases and Storage.

## Project Structure

| Path      | Purpose                                        |
| --------- | ---------------------------------------------- |
| backend/  | FastAPI app, domain routes, cron setup         |
| frontend/ | React multi-portal UI and routing              |
| docs/     | PRD, final feature scope, presentation support |

## API Modules (Backend)

- /api/complaints
- /api/ai
- /api/workers
- /api/leaderboard
- /api/stats
- /api/users
- /api/uploads

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Appwrite project

### 1) Clone and install

```bash
git clone https://github.com/Nehul1605/Smart-Public-Service-CRM-PS-CRM
cd Smart-Public-Service-CRM-PS-CRM

# Backend setup
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

# Frontend setup
cd frontend
npm install
```

### 2) Configure environment

Backend: create backend/.env

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_server_api_key
APPWRITE_DATABASE_ID=your_database_id
APPWRITE_COLLECTION_ID=complaints
APPWRITE_BUCKET_ID=your_bucket_id
GROQ_API_KEY=your_groq_api_key
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_app_password
ADMIN_EMAIL=your_admin_email
```

Frontend: create frontend/.env.local

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=your_database_id
VITE_APPWRITE_COMPLAINTS_COLLECTION_ID=complaints
VITE_APPWRITE_BUCKET_ID=your_bucket_id
VITE_API_URL=http://localhost:8000
VITE_RENDER_API_URL=https://smart-public-service-crm-ps-crm.onrender.com
```

### 3) Run locally

Terminal 1:

```bash
cd backend
python main.py
```

Terminal 2:

```bash
cd frontend
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Health check: http://localhost:8000/health

## Final Submission Docs

- Product requirements: [docs/PRD.md](docs/PRD.md)
- Final feature scope: [docs/Final_features.md](docs/Final_features.md)
- PPT slide content (ready-to-use): [docs/Final_Submission_PPT.md](docs/Final_Submission_PPT.md)

## Security Notes

- Never commit real secrets in env files.
- Rotate keys before external demos.
- Use demo/test credentials only for hackathon submissions.

## License

MIT

Built for civic transparency, accountability, and faster public service delivery.
