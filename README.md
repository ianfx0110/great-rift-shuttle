# Great Rift Shuttle (GRS)

Premium Transport Sacco Management System for Kenya's Great Rift Valley corridors and beyond.

## Overview

Great Rift Shuttle is a professional transport management application designed for SACCOs. It provides a seamless experience for passengers to book trips and for SACCO staff to manage fleet, drivers, and logistics (parcels).

## Key Features

- **Passenger Booking**: Real-time trip selection and seat booking.
- **Logistics & Parcels**: End-to-end parcel tracking and management.
- **Driver Terminal**: Specialized dashboard for drivers to manage their manifests and trips.
- **Clerk Portal**: Counter-side terminal for office clerks to handle walk-in bookings and shipments.
- **Admin Command Center**: High-level overview of revenue, fleet status, and system users.
- **Role-Based Access Control**: Secure login for Admin, Driver, Clerk, and Booker (Passenger).

## Tech Stack

- **Frontend**: HTML5, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js (Express), PostgreSQL.
- **Authentication**: JWT-based secure sessions.

## Role Specific Dashboards

- `/admin.html`: Fleet and system overview.
- `/driver_dashboard.html`: Active manifests and trip control.
- `/clerk_dashboard.html`: Office operations and logistics.
- `/dashboard.html`: Passenger booking history and profile.

## Local Development

1. Install dependencies: `npm install`
2. Configure environment variables in `.env`.
3. Start the server: `npm run dev`
