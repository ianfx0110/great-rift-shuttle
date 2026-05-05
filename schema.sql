CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'booker'
    CHECK (role IN ('booker', 'admin', 'driver', 'clerk')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT UNIQUE NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  license_expiry_date DATE NOT NULL,
  date_joined DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'on_leave', 'suspended', 'terminated')),
  rating_cache NUMERIC(3,2) DEFAULT 5.00,
  profile_img_url TEXT
);

CREATE TABLE IF NOT EXISTS hubs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  number_plate TEXT UNIQUE NOT NULL,
  model TEXT,
  color TEXT,
  capacity INTEGER NOT NULL,
  exterior_img_url TEXT,
  interior_img_url TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'maintenance', 'retired')),
  type TEXT DEFAULT 'Shuttle'
);

CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  base_price NUMERIC(10,2) NOT NULL,
  distance_km NUMERIC,
  estimated_duration INTERVAL
);

CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  route_id INTEGER NOT NULL REFERENCES routes(id) ON DELETE RESTRICT,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  departure_time TIMESTAMP NOT NULL,
  arrival_time TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'en_route', 'completed', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  schedule_id INTEGER REFERENCES schedules(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  seat_number INTEGER NOT NULL,
  booking_reference TEXT UNIQUE NOT NULL,
  fare_paid NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  mpesa_checkout_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'confirmed'
    CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_schedule_seat UNIQUE (schedule_id, seat_number)
);

CREATE TABLE IF NOT EXISTS parcels (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  sender_name TEXT NOT NULL,
  sender_phone TEXT NOT NULL,
  sender_email TEXT,
  receiver_name TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  receiver_email TEXT,
  route_id INTEGER REFERENCES routes(id) ON DELETE SET NULL,
  origin_hub_id INTEGER REFERENCES hubs(id) ON DELETE SET NULL,
  destination_hub_id INTEGER REFERENCES hubs(id) ON DELETE SET NULL,
  description TEXT,
  weight_kg NUMERIC(5,2),
  price NUMERIC(10,2) NOT NULL,
  tracking_number TEXT UNIQUE NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  mpesa_checkout_id TEXT UNIQUE,
  tracking_status TEXT NOT NULL DEFAULT 'received'
    CHECK (tracking_status IN ('received', 'in_transit', 'delivered', 'collected')),
  is_fragile BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'resolved', 'closed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inquirychats (
  id SERIAL PRIMARY KEY,
  inquiry_id INTEGER NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL DEFAULT 'client'
    CHECK (sender_role IN ('client', 'admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  schedule_id INTEGER REFERENCES schedules(id) ON DELETE SET NULL,
  vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
  driver_id INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
  client_name TEXT,
  rating INTEGER CHECK (rating BETWEEN 0 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL
    CHECK (type IN ('email', 'sms')),
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('sent', 'failed', 'pending')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
