# EventHub — Smart College Event Management

Your full app is saved in this folder:

```
EventHub/
├── backend/          API (Express + MongoDB + Razorpay + JWT Auth)
├── frontend/         React UI (EventHub)
├── config/           Copy these to .env when you add keys
├── README.md         Full setup guide
└── START_HERE.md     This file
```

## MongoDB Atlas

Configured in `backend/.env`:

```
MONGO_URI=mongodb+srv://smart:***@smarthub.pxafrge.mongodb.net/smarthub?appName=SmartHub
```

## Default login accounts (seeded on first run)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smarthub.edu | Admin@123 |
| Organizer | organizer@smarthub.edu | Organizer@123 |
| Student | student@smarthub.edu | Student@123 |

New users can **Register** as students. Admin/organizer roles are assigned via seeded accounts.

## First-time setup

```bash
# 1. Backend
cd backend
npm install
npm run dev

# 2. Frontend (new terminal)
cd frontend
npm install
npm start
```

## Open the app

- Frontend: http://localhost:3000
- Backend: http://localhost:5001/api/health

## Authorization

| Action | Roles allowed |
|--------|----------------|
| Browse events | Everyone |
| Register / pay | Signed-in users |
| Create events | Organizer, Admin |
| Transactions / Payment settings | Admin only |
