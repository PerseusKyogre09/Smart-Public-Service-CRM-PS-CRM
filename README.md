# CivicPulse Delhi: Smart Public Service CRM (PS-CRM)

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Appwrite](https://img.shields.io/badge/Backend_as_a_Service-Appwrite-f02e65?style=for-the-badge&logo=appwrite&logoColor=white)](https://appwrite.io)
[![Tailwind CSS](https://img.shields.io/badge/UI-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

CivicPulse Delhi is a civic engagement platform designed for the Government of NCT of Delhi. It enables citizens to report and track civic issues, while departments manage assignment, SLA monitoring, and closure evidence in a transparent workflow.

---

## Multi-Portal Ecosystem

### Citizen Portal

_Empowering Delhi's community action through engagement._

- Smart reporting with location selection and AI-assisted category suggestion.
- Interactive map to view nearby issues and track status.
- Reputation-oriented participation based on verified complaint outcomes.
- Personal dashboard with complaint lifecycle visibility.

### Admin Portal

_High-level oversight and system-wide management._

- Global analytics for SLA compliance and resolution trends.
- User management and complaint oversight.
- Unified queue for filtering and operational monitoring.
- SLA configuration workflows.

### Manager Portal

_Regional operations and workflow optimization._

- Jurisdiction-focused complaint monitoring.
- Worker assignment and reassignment controls.
- Team performance visibility for area operations.
- Backend-driven routing transitions.

### Worker Portal

_Field execution and resolution verification._

- SLA-prioritized task dashboard.
- Structured status updates from assignment to resolution.
- GPS-locked proof upload for transparent closure evidence.
- Service history tracking.

---

## Key Technical Features

- AI-assisted category suggestion (Smart-Snap).
- SLA tracking with escalation-oriented workflow.
- Role-based access across citizen, admin, manager, and worker flows.
- Appwrite-backed data and storage integrations.

---

## Architecture

- Frontend: React 18, Vite, Tailwind CSS v4.
- Backend: FastAPI, Pydantic.
- Infrastructure: Appwrite (Auth, Databases, Storage).

---

## Project Structure

| Path      | Purpose                                  |
| --------- | ---------------------------------------- |
| backend/  | FastAPI application and API routes       |
| frontend/ | React multi-portal application           |
| docs/     | Product and implementation documentation |

---

## Portals Quick Reference

| Portal  | Primary User      | Key Goal                      |
| ------- | ----------------- | ----------------------------- |
| Citizen | General Public    | Report and track issues       |
| Admin   | System Admins     | Monitor performance and queue |
| Manager | Regional Managers | Route and supervise tasks     |
| Worker  | Field Officers    | Resolve tasks with proof      |

---

## Quick Start

### Prerequisites

- Python 3.10+
- Node.js 18+
- Appwrite project

### 1) Clone and Install

```bash
git clone https://github.com/Nehul1605/Smart-Public-Service-CRM-PS-CRM
cd Smart-Public-Service-CRM-PS-CRM

# Setup Backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

# Setup Frontend
cd frontend
npm install
```

### 2) Environment Configuration

Create backend and frontend environment files.

Backend file: backend/.env

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

Frontend file: frontend/.env.local

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_API_URL=http://localhost:8000
```

### 3) Run Locally

**Terminal 1 (Backend):**

```bash
cd backend
python main.py
```

**Terminal 2 (Frontend):**

```bash
cd frontend
npm run dev
```

Frontend runs at http://localhost:5173 and backend runs at http://localhost:8000.

## Documentation

- Product Requirements: [docs/PRD.md](docs/PRD.md)
- Feature Scope: [docs/Final_features.md](docs/Final_features.md)
- Docker and local run notes: [docs/docker.md](docs/docker.md)

## Security Notes

- Never commit real secrets in backend/.env or frontend/.env.local.
- Use backend/.env.example as the template for local setup.
- Rotate API keys and app passwords before any public demo.

---

## License

This project is licensed under the MIT License.

---

Created for civic transparency and service accountability.
