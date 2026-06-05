# Smart College Event Management (EventHub)

Full-stack campus event platform with **MongoDB**, **Razorpay** payments, and the EventHub UI (React + Tailwind + Framer Motion).

## Project structure

```
smart-college-event-management/
├── backend/          # Express + MongoDB + Razorpay
│   ├── .env.example
│   └── src/
├── frontend/         # React EventHub UI
│   ├── .env.example
│   └── src/
│       ├── api/      # API client
│       ├── views/    # Pages (Home, Events, Payment, Dashboard, …)
│       └── components/
└── README.md
```

## 1. MongoDB setup

1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (or run MongoDB locally).
2. Copy your connection string.
3. Create `backend/.env` from the example:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/smart-events?retryWrites=true&w=majority
PORT=5001
```

4. Start the backend (it auto-seeds 4 demo events on first connect):

```bash
npm install
npm run dev
```

Check: [http://localhost:5001/api/health](http://localhost:5001/api/health) should show `"db": "connected"`.

## 2. Razorpay setup

1. Get **Test** keys from [Razorpay Dashboard → API Keys](https://dashboard.razorpay.com/app/keys).
2. Add to `backend/.env` (recommended — secrets stay on server):

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
RAZORPAY_CURRENCY=INR
RAZORPAY_MODE=test
```

**Or** sign in as **System Admin** → **Payment Settings** in the app (saved to MongoDB when env vars are empty).

> Never put `RAZORPAY_KEY_SECRET` in frontend code or `REACT_APP_*` variables.

## 3. Frontend setup

```bash
cd frontend
cp .env.example .env   # optional; proxy defaults to localhost:5001
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

| Role | Can do |
|------|--------|
| **Student** | Browse events, register (free or Razorpay), get digital ticket + QR |
| **Organizer** | Dashboard, create events (saved to MongoDB) |
| **Admin** | Above + Payment Settings + Transactions list |

### Payment flow

1. Student registers for a paid event → Razorpay Checkout opens.
2. Backend creates order → verifies signature → saves ticket + transaction in MongoDB.

Free events skip Razorpay and register immediately.

## API overview

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server + DB status |
| GET | `/api/events` | List events |
| POST | `/api/events` | Create event |
| POST | `/api/events/:id/register-free` | Free registration |
| GET | `/api/payments/config` | Public Razorpay key + status |
| PUT | `/api/payments/settings` | Save gateway settings (admin UI) |
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify payment & issue ticket |
| GET | `/api/events/transactions/list` | Payment history |

## When you have your keys

Share (privately) or paste into `backend/.env`:

- `MONGO_URI` — MongoDB connection string  
- `RAZORPAY_KEY_ID` — starts with `rzp_test_` or `rzp_live_`  
- `RAZORPAY_KEY_SECRET` — server-only secret  

Restart the backend after changing `.env`.
