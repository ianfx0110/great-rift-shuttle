-- Great Rift Shuttle Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  phone TEXT,
  role TEXT DEFAULT 'booker', -- booker, admin, driver, clerk
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  id_number TEXT UNIQUE NOT NULL,
  phone_number TEXT UNIQUE NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  license_expiry_date DATE NOT NULL,
  date_joined DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active', -- active, on_leave, suspended, terminated
  rating_cache REAL DEFAULT 5.00,
  profile_img_url TEXT
);

-- Hubs/Terminals table
CREATE TABLE IF NOT EXISTS hubs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL
);

-- Fleet Vehicles (Great Rift Shuttles)
CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  number_plate TEXT UNIQUE NOT NULL,
  model TEXT,
  color TEXT,
  capacity INTEGER NOT NULL,
  exterior_img_url TEXT,
  interior_img_url TEXT,
  status TEXT DEFAULT 'active', -- active, maintenance, retired
  type TEXT DEFAULT 'Shuttle'
);

-- Service Routes (Rift Valley Corridors)
CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  base_fare REAL NOT NULL,
  distance_km REAL,
  estimated_duration TEXT
);

-- Departure Schedules
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  route_id INTEGER NOT NULL REFERENCES routes(id),
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id),
  driver_id INTEGER REFERENCES drivers(id),
  departure_time TIMESTAMP NOT NULL,
  arrival_time TIMESTAMP,
  status TEXT DEFAULT 'scheduled' -- scheduled, en_route, completed, cancelled
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER, -- Optional, for registered users
  schedule_id INTEGER REFERENCES schedules(id), -- Renamed from trip_id for consistency with app logic
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_email TEXT,
  seat_number INTEGER NOT NULL,
  booking_reference TEXT UNIQUE NOT NULL,
  fare_paid REAL NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded
  mpesa_checkout_id TEXT UNIQUE,
  status TEXT DEFAULT 'confirmed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Great Rift Logistics (Parcels)
CREATE TABLE IF NOT EXISTS parcels (
  id SERIAL PRIMARY KEY,
  sender_id INTEGER, -- Optional
  sender_name TEXT NOT NULL,
  sender_phone TEXT NOT NULL,
  sender_email TEXT,
  receiver_name TEXT NOT NULL,
  receiver_phone TEXT NOT NULL,
  receiver_email TEXT,
  route_id INTEGER REFERENCES routes(id),
  origin_hub_id INTEGER REFERENCES hubs(id),
  destination_hub_id INTEGER REFERENCES hubs(id),
  description TEXT,
  weight_kg REAL,
  price REAL NOT NULL,
  tracking_number TEXT UNIQUE NOT NULL,
  payment_status TEXT DEFAULT 'pending', -- pending, paid, refunded
  mpesa_checkout_id TEXT UNIQUE,
  tracking_status TEXT DEFAULT 'received', -- received, in_transit, delivered, collected
  is_fragile BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inquiries table
CREATE TABLE IF NOT EXISTS inquiries (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'open', -- open, resolved, closed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inquiry Chats table
CREATE TABLE IF NOT EXISTS inquirychats (
  id SERIAL PRIMARY KEY,
  inquiry_id INTEGER REFERENCES inquiries(id) ON DELETE CASCADE,
  sender_role TEXT DEFAULT 'client', -- client, admin
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES schedules(id),
  vehicle_id INTEGER REFERENCES vehicles(id),
  driver_id INTEGER REFERENCES drivers(id),
  client_name TEXT,
  rating INTEGER CHECK (rating BETWEEN 0 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications log
CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  type TEXT NOT NULL, -- email, sms
  recipient TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM hubs) = 0 THEN
    INSERT INTO hubs (name, location, code) VALUES
    ('Nairobi CBD Terminal', 'River Road', 'NBO-01'),
    ('Nakuru Main Terminal', 'Opp. Railway', 'NKU-01'),
    ('Kisumu Hub', 'Kondele', 'KIS-01'),
    ('Eldoret Depot', 'Town Center', 'ELD-01');
  END IF;

  IF (SELECT COUNT(*) FROM drivers) = 0 THEN
    INSERT INTO drivers (first_name, last_name, id_number, phone_number, license_number, license_expiry_date) VALUES
    ('John', 'Kamau', '12345678', '0711111111', 'DL-88221', '2028-12-31'),
    ('Peter', 'Maina', '87654321', '0722222222', 'DL-99334', '2027-06-30');
  END IF;

  IF (SELECT COUNT(*) FROM routes) = 0 THEN
    INSERT INTO routes (origin, destination, distance_km, base_fare, estimated_duration) VALUES
    ('Nairobi', 'Nakuru', 160, 800, '3 hours'),
    ('Nakuru', 'Nairobi', 160, 800, '3 hours'),
    ('Nairobi', 'Kisumu', 350, 1500, '6 hours');
  END IF;

  IF (SELECT COUNT(*) FROM vehicles) = 0 THEN
    INSERT INTO vehicles (number_plate, model, capacity, status, type) VALUES
    ('KCA 123A', 'Toyota Hiace', 14, 'active', 'Luxury Shuttle'),
    ('KDB 456B', 'Mercedes Sprinter', 10, 'active', 'Executive Shuttle');
  END IF;

  IF (SELECT COUNT(*) FROM users) = 0 THEN
    -- password is 'password' hashed with a simple placeholder logic for this demo (assuming server handles plain for demo or knows these)
    INSERT INTO users (name, email, password, role) VALUES
    ('Admin User', 'admin@grs.com', 'password', 'admin'),
    ('Driver John', 'john@grs.com', 'password', 'driver'),
    ('Clerk Jane', 'jane@grs.com', 'password', 'clerk'),
    ('Booker Bob', 'bob@grs.com', 'password', 'booker');
  END IF;

  IF (SELECT COUNT(*) FROM schedules) = 0 THEN
    INSERT INTO schedules (route_id, vehicle_id, driver_id, departure_time, arrival_time) VALUES
    (1, 1, 1, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours'),
    (3, 2, 2, NOW() + INTERVAL '4 hours', NOW() + INTERVAL '10 hours');
  END IF;
END $$;
