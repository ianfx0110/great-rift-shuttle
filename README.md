# Great Rift Shuttle - Premier Kenyan Matatu SACCO Platform

Welcome to the Great Rift Shuttle platform, a full-stack solution for passenger travel booking, parcel delivery, freight logistics, and charter hire.

## 🚀 Features
- **Passenger Booking:** 6-step wizard with real-time seat selection and M-Pesa integration.
- **Parcel Courier:** Quote calculation based on weight/size and live tracking.
- **Freight & Cargo:** Moving heavy goods with ease.
- **Charter Hire:** Exclusive vehicle hiring for events.
- **Account Management:** User profiles and history.
- **Admin Dashboard:** Full control over routes, schedules, vehicles, and payments.

## 🛠 Technology Stack
- **Backend:** Node.js + Express.js
- **Frontend:** EJS (Server-rendered)
- **Styling:** Vanilla CSS
- **JS:** Vanilla JavaScript
- **Database:** PostgreSQL
- **Authentication:** Cookie-based sessions

## 📦 Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Optional, defaults to SQLite)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
4. Run migrations and seed data:
   ```bash
   npm run db:migrate
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

### M-Pesa Sandbox Setup
1. Register at [Safaricom Developer Portal](https://developer.safaricom.co.ke/).
2. Create a Sandbox app to get your `CONSUMER_KEY` and `CONSUMER_SECRET`.
3. Use the provided `LNM Passkey` for the `MPESA_PASSKEY`.

### Africa's Talking Setup
1. Create an account at [Africa's Talking](https://africastalking.com/).
2. Get your API Key and Username.
3. Use the Sandbox app for local testing.

## 📁 Project Structure
- `/views`: EJS templates and sections.
- `/public`: Static assets (CSS, JS, Images).
- `/server`: Backend logic and routes.
- `/db`: Database initialization and migrations.

## 📜 License
SPDX-License-Identifier: Apache-2.0
