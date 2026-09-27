# 🌾 KrishiFlow

**Smart Procurement Slot & Queue Management System**

> "Book your slot. Track your queue. Know your payment."

Built for **Smart India Hackathon 2026** — Problem Statement ID **26032**
Organization: Ministry of Consumer Affairs, Food & Public Distribution (Department of Consumer Affairs)
Category: Software · Theme: Smart Automation

---

## 1. Problem Statement

Farmers often face long waiting times, lack of information regarding procurement schedules, and uncertainty about procurement status at government procurement centres.

## 2. Our Solution

KrishiFlow is a full-stack platform that lets farmers register, pick a procurement centre, book a time slot, and receive a **digital queue token**. Farmers can track their **live queue position**, watch their **procurement progress** (arrival → quality check → weighing → completion), and follow their **payment status** — all updating in real time via Socket.IO, without refreshing the page. Procurement centre operators get a live operational dashboard to call the next farmer and move each booking through the procurement/payment pipeline. Admins get a full analytics dashboard across all centres.

## 3. Features

### Farmer
- Register / Login / Logout, profile view & update, language preference (English/Hindi/Marathi)
- Browse procurement centres, view details, supported crops
- 6-step slot booking wizard (Centre → Crop → Quantity → Date → Slot → Confirm)
- Digital token generation with duplicate-booking and overbooking prevention
- Live queue position, farmers-ahead count, and estimated waiting time (auto-updating)
- Booking history with cancellation (while still `BOOKED`)
- Visual procurement progress timeline
- Payment status tracking (prototype/simulated)
- In-app notification bell with unread count

### Procurement Centre Operator
- Live dashboard: today's bookings, waiting, completed, pending payments
- Live queue table with search by token / name / phone
- **Call Next Farmer** (broadcasts instantly to that farmer's screen)
- Mark arrived → start/complete quality check → enter weight & rate → auto-calculate total → complete procurement
- Move payment to Processing → Mark Payment Completed (generates a demo transaction ID)
- All actions broadcast over Socket.IO to the farmer and to other centre staff viewing the same queue

### Admin
- Platform-wide stats: total farmers, total centres, today's bookings, waiting farmers, completed/pending procurement, completed/pending payments, total procurement amount
- Charts (Recharts): daily bookings, centre-wise queue volume, payment status breakdown, procurement status
- Add / edit / deactivate procurement centres, choose supported crops per centre
- View farmers, bookings, payments records

## 4. Tech Stack

**Frontend:** React 18, Vite, React Router DOM, Axios, Tailwind CSS, Lucide React, Recharts, Socket.IO Client, react-hot-toast

**Backend:** Node.js, Express, MongoDB + Mongoose, JWT, bcryptjs, Socket.IO, CORS, dotenv

**Database:** MongoDB Atlas

**Deployment:** Vercel (frontend) · Render (backend) · MongoDB Atlas (database)

## 5. Architecture

```
Browser (React SPA)
   │  REST (Axios, JWT bearer)          │ WebSocket (Socket.IO)
   ▼                                     ▼
Express API  ──────────────────────  Socket.IO server
   │                                     │
   ├─ controllers/ (business logic)      ├─ rooms: user:<id>, centre:<id>
   ├─ services/ (queue math, notify)     └─ broadcasts: queueUpdated, farmerCalled,
   ├─ middleware/ (JWT auth, roles)          bookingUpdated, notificationCreated,
   └─ models/ (Mongoose schemas)             procurementUpdated, paymentUpdated
   │
   ▼
MongoDB Atlas
```

Key design point: **queue position and waiting time are never stored** — they're computed on demand in `services/queueService.js` from each booking's sequential `token` number versus the centre's current "now serving" token, multiplied by the centre's average processing time. This keeps the queue always consistent even if operators skip around.

## 6. Folder Structure

```
KrishiFlow/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/      # Navbar, ProtectedRoute, StatusBadge, ProcurementTimeline...
│   │   ├── layouts/          # MainLayout
│   │   ├── pages/            # LandingPage, Login, Register, Profile, Notifications
│   │   │   ├── farmer/       # FarmerDashboard, BookSlot, LiveQueue, ...
│   │   │   ├── centre/       # CentreDashboard
│   │   │   └── admin/        # AdminDashboard, ManageCentres
│   │   ├── services/         # api.js + one service file per API area
│   │   ├── context/          # AuthContext, SocketContext, LanguageContext
│   │   ├── utils/             # i18n.js, constants.js
│   │   ├── App.jsx, main.jsx, index.css
│   ├── package.json, vite.config.js, tailwind.config.js, postcss.config.js, .env.example
├── backend/
│   ├── config/db.js
│   ├── controllers/          # auth, farmer, centre, slot, booking, queue, procurement, payment, notification, admin, centreDashboard
│   ├── middleware/            # authMiddleware.js, errorMiddleware.js
│   ├── models/                 # User, ProcurementCentre, Slot, Booking, Procurement, Payment, Notification
│   ├── routes/
│   ├── services/               # notificationService.js, queueService.js
│   ├── socket/socketHandler.js
│   ├── utils/                  # asyncHandler, generateToken, generateIds
│   ├── seed/seed.js
│   ├── server.js, package.json, .env.example
├── README.md
└── .gitignore
```

## 7. Prerequisites

- Node.js 18+ and npm
- A MongoDB Atlas cluster (free tier is enough) — or a local MongoDB instance

## 8. MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a database user (Database Access) with a username/password.
3. Under Network Access, add your IP (or `0.0.0.0/0` for the hackathon demo).
4. Click **Connect → Drivers**, copy the connection string, e.g.:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/KrishiFlow?retryWrites=true&w=majority`
5. Paste this into `backend/.env` as `MONGO_URI`.

## 9. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env`:

```
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

Seed demo data (creates demo accounts, 5 centres, slots, and a live 27-token queue):

```bash
npm run seed
```

Run the backend:

```bash
npm run dev
```

The API will run at `http://localhost:5000`. Health check: `GET http://localhost:5000/api/health`.

## 10. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Run the frontend:

```bash
npm run dev
```

Open `http://localhost:5173`.

## 11. Demo Accounts

> ⚠️ These are **demo accounts for hackathon evaluation only** — created by `npm run seed`.

| Role   | Email                     | Password    |
|--------|----------------------------|-------------|
| Admin  | admin@KrishiFlow.com      | Admin@123   |
| Centre | centre@KrishiFlow.com     | Centre@123  |
| Farmer | farmer@KrishiFlow.com     | Farmer@123  |

The demo farmer is seeded with **Token #27** at **Pune APMC Procurement Centre**, with 19 farmers already completed and a few in progress, so the full live-demo flow works immediately after seeding.

## 12. Suggested Live Demo Flow

1. Login as `farmer@KrishiFlow.com` → Dashboard shows active booking, Token #27, farmers ahead, estimated wait.
2. Open `/queue/:bookingId` (via "Track Queue") to see the live queue screen.
3. In a second browser/incognito tab, login as `centre@KrishiFlow.com` → Centre Dashboard.
4. Click **Call Next Farmer** repeatedly (or search a token) until Token #27 is called — watch the farmer's queue screen update instantly with no refresh.
5. As the centre operator: Manage → Start Quality Check → mark Passed → enter weight & rate → Complete Procurement (amount auto-calculates) → Move Payment to Processing → Mark Payment Completed (generates a demo transaction ID like `PAY-KQ-2026-XXXXXXXX`).
6. Back on the farmer's screen: the procurement timeline and payment status update live, and a notification appears in the bell icon.
7. Login as `admin@KrishiFlow.com` to see the updated stats and charts reflect the new completed procurement/payment.

## 13. API Overview

All endpoints are prefixed with `/api`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Farmer | `GET/PUT /farmers/profile` |
| Centres | `GET /centres`, `GET /centres/:id`, `POST/PUT/DELETE /centres/:id` (admin) |
| Slots | `GET /slots?centreId=&date=`, `POST /slots` |
| Bookings | `POST /bookings`, `GET /bookings/my`, `GET /bookings/:id`, `PATCH /bookings/:id/cancel` |
| Queue | `GET /queue/:centreId`, `GET /queue/booking/:bookingId`, `PATCH /queue/:bookingId/call` |
| Procurement | `PATCH /procurement/:bookingId/arrive`, `/quality/start`, `/quality/complete`, `/weigh` |
| Payments | `GET /payments/:bookingId`, `PATCH /payments/:bookingId/process`, `/complete` |
| Notifications | `GET /notifications`, `PATCH /notifications/:id/read`, `/read-all` |
| Admin | `GET /admin/stats`, `/bookings`, `/payments`, `/farmers`, `/centres` |
| Centre Dashboard | `GET /centre-dashboard/summary`, `/search?q=` |

All protected routes require `Authorization: Bearer <token>`. Role checks are enforced with `protect` + `authorize('farmer'|'centre'|'admin')` middleware.

## 14. Socket.IO Events

**Client emits:** `joinUserRoom({ userId })`, `joinCentreQueue({ centreId })`, `leaveCentreQueue({ centreId })`

**Server broadcasts:** `queueUpdated`, `farmerCalled`, `bookingUpdated`, `notificationCreated`, `procurementUpdated`, `paymentUpdated`

Rooms: `user:<userId>` (personal notifications/booking updates) and `centre:<centreId>` (live queue for everyone watching that centre).

## 15. Payments — Important Note

This is a **hackathon prototype**. No real banking/payment gateway is integrated. `Payment` records are simulated: when a centre operator marks a payment completed, the backend generates a realistic-looking demo transaction ID (e.g. `PAY-KQ-2026-78293482`). The UI clearly labels the payment screen as a prototype/simulated system.

## 16. SMS Notifications — Important Note

SMS is **not required** for this prototype. `backend/services/notificationService.js` is written as an abstraction: every notification is created and delivered in-app (and pushed live via Socket.IO). A `sendSms()` stub exists so a real provider (Twilio, MSG91, etc.) can be wired in later without touching any other part of the codebase.

## 17. Deployment

### Backend → Render

1. Push the `backend/` folder to a GitHub repo (or the whole monorepo with Root Directory set to `backend`).
2. On Render: **New → Web Service** → connect the repo → Root Directory: `backend`.
3. Build Command: `npm install` · Start Command: `npm start`.
4. Add Environment Variables in Render's dashboard:
   - `MONGO_URI` = your Atlas connection string
   - `JWT_SECRET` = a long random string
   - `JWT_EXPIRE` = `7d`
   - `CLIENT_URL` = your deployed Vercel URL (e.g. `https://KrishiFlow.vercel.app`)
   - `PORT` is set automatically by Render; the app reads `process.env.PORT`.
5. Deploy. Note the resulting URL, e.g. `https://KrishiFlow-api.onrender.com`.

### Frontend → Vercel

1. Import the repo on Vercel, set Root Directory to `frontend`.
2. Framework preset: Vite. Build Command: `npm run build`. Output Directory: `dist`.
3. Add Environment Variables in Vercel's dashboard:
   - `VITE_API_URL` = `https://KrishiFlow-api.onrender.com/api`
   - `VITE_SOCKET_URL` = `https://KrishiFlow-api.onrender.com`
4. Deploy. Update the backend's `CLIENT_URL` env var on Render to match your final Vercel URL, then redeploy the backend so CORS/Socket.IO allow it.

### Database → MongoDB Atlas

Already covered in Section 8. Make sure Network Access allows connections from Render (either your Render outbound IP or `0.0.0.0/0` for the hackathon demo).

## 18. Running the Seed Script Again

The seed script is destructive — it clears `users`, `procurementcentres`, `slots`, `bookings`, `procurements`, `payments`, and `notifications` before recreating demo data. Re-run any time with:

```bash
cd backend
npm run seed
```

## 19. Troubleshooting

| Symptom | Fix |
|---|---|
| `MongoNetworkError` / connection timeout | Check `MONGO_URI`, and that your IP is allowed in Atlas Network Access |
| CORS error in browser console | Ensure `CLIENT_URL` in backend `.env` exactly matches the frontend's origin (no trailing slash) |
| Socket.IO not updating live | Check `VITE_SOCKET_URL` points to the backend root (not `/api`), and that the backend is reachable |
| 401 Unauthorized on every request | Token expired/missing — log out and log back in; check `JWT_SECRET` matches between requests |
| Slot shows "Full" immediately | The seed script books many slots at Pune APMC on today's date — try another date or centre |
| `npm run seed` fails to connect | Backend `.env` must exist and contain a valid `MONGO_URI` before seeding |

---

Built for Smart India Hackathon 2026. All payment and SMS functionality in this prototype is simulated for demonstration purposes only.
