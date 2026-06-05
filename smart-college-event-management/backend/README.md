# Backend - Smart College Event Management

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file (optional):
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/smart-events
   STRIPE_SECRET_KEY=your_stripe_key
   ```
3. Run server:
   ```bash
   npm start
   ```

## API Endpoints

- `GET /api/health`
- `GET /api/events?filter=upcoming|ongoing|past`
- `POST /api/events`
- `POST /api/events/:id/register`
- `POST /api/events/:id/pay`
- `POST /api/events/check-in`
