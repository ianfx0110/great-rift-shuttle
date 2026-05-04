import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import axios from 'axios';
import pool, { initDb, query } from './db/index.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Great Rift Shuttle Database
  await initDb();

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // Safaricom M-Pesa Integration helpers
  const getMpesaToken = async () => {
    const key = process.env.MPESA_CONSUMER_KEY;
    const secret = process.env.MPESA_CONSUMER_SECRET;
    if (!key || !secret) return null;
    
    const auth = Buffer.from(`${key}:${secret}`).toString('base64');
    try {
      const response = await axios.get('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
        headers: { Authorization: `Basic ${auth}` }
      });
      return response.data.access_token;
    } catch (error) {
      console.error('Mpesa Token Error:', error.response?.data || error.message);
      return null;
    }
  };

  const initiateStkPush = async (phone, amount, reference) => {
    const token = await getMpesaToken();
    if (!token) throw new Error('Failed to get Mpesa token');

    const shortcode = process.env.MPESA_SHORTCODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(shortcode + passkey + timestamp).toString('base64');

    const payload = {
      BusinessShortCode: shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: phone,
      PartyB: shortcode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: reference,
      TransactionDesc: `Payment for ${reference}`
    };

    try {
      const response = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/query', ); // Wait, this is query. I need process request.
      // Re-writing correct STK push endpoint
      const res = await axios.post('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (error) {
      console.error('STK Push Error:', error.response?.data || error.message);
      throw error;
    }
  };

  // M-Pesa Callback
  app.post('/api/mpesa/callback', async (req, res) => {
    const { Body } = req.body;
    if (!Body || !Body.stkCallback) return res.sendStatus(400);

    const { CheckoutRequestID, ResultCode, ResultDesc } = Body.stkCallback;
    const status = ResultCode === 0 ? 'completed' : 'failed';

    try {
      await query('UPDATE bookings SET payment_status = $1 WHERE mpesa_checkout_id = $2', [status, CheckoutRequestID]);
      await query('UPDATE parcels SET payment_status = $1 WHERE mpesa_checkout_id = $2', [status, CheckoutRequestID]);
      console.log(`Mpesa Callback processed: ${CheckoutRequestID} -> ${status}`);
    } catch (error) {
      console.error('Callback storage error:', error);
    }
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  });

  // Check Payment Status
  app.get('/api/payment/status/:checkoutId', async (req, res) => {
    const { checkoutId } = req.params;
    try {
      const booking = await query('SELECT payment_status FROM bookings WHERE mpesa_checkout_id = $1', [checkoutId]);
      const parcel = await query('SELECT payment_status FROM parcels WHERE mpesa_checkout_id = $1', [checkoutId]);
      
      const status = booking.rows[0]?.payment_status || parcel.rows[0]?.payment_status || 'pending';
      res.json({ status });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // User Authentication (Bookers, Admin, Drivers, Clerks)
  app.post('/api/auth/register', async (req, res) => {
    const { name, email, password, phone } = req.body;
    try {
      const result = await query(`
        INSERT INTO users (name, email, password, phone, role)
        VALUES ($1, $2, $3, $4, 'booker')
        RETURNING id, name, email, role
      `, [name, email, password, phone]);
      res.json({ success: true, user: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const result = await query('SELECT * FROM users WHERE email = $1 AND password = $2', [email, password]);
      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      res.json({ success: true, user: result.rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // User History
  app.get('/api/user/bookings', async (req, res) => {
    const { userId } = req.query;
    try {
      const result = await query(`
        SELECT b.*, s.departure_time, r.origin, r.destination
        FROM bookings b
        JOIN schedules s ON b.schedule_id = s.id
        JOIN routes r ON s.route_id = r.id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC
      `, [userId]);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Routes
  
  // Routes & Destinations
  app.get('/api/routes', async (req, res) => {
    try {
      const result = await query('SELECT * FROM routes');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Schedules
  app.get('/api/schedules', async (req, res) => {
    const { origin, destination, date } = req.query;
    let queryString = `
      SELECT s.*, r.origin, r.destination, r.base_fare, v.number_plate, v.type, v.capacity
      FROM schedules s
      JOIN routes r ON s.route_id = r.id
      JOIN vehicles v ON s.vehicle_id = v.id
      WHERE 1=1
    `;
    const params = [];
    let paramCounter = 1;

    if (origin) {
      queryString += ` AND r.origin = $${paramCounter++}`;
      params.push(origin);
    }
    if (destination) {
      queryString += ` AND r.destination = $${paramCounter++}`;
      params.push(destination);
    }
    if (date) {
      queryString += ` AND s.departure_time::date = $${paramCounter++}::date`;
      params.push(date);
    }
    
    try {
      const result = await query(queryString, params);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bookings
  app.post('/api/bookings', async (req, res) => {
    const { userId, scheduleId, seatNumber, farePaid, phone } = req.body;
    const ref = 'GRS-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    
    try {
      // 1. Initiate M-Pesa STK Push
      const cleanPhone = (phone || '').replace(/\+/g, '').replace(/^0/, '254');
      const mpesaResponse = await initiateStkPush(cleanPhone, farePaid, ref);
      const checkoutId = mpesaResponse.CheckoutRequestID;

      // 2. Create Booking with pending status and checkout ID
      const result = await query(`
        INSERT INTO bookings (user_id, schedule_id, seat_number, booking_reference, fare_paid, mpesa_checkout_id, client_name, client_phone, client_email)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `, [userId || null, scheduleId, seatNumber, ref, farePaid, checkoutId, req.body.clientName || 'Guest', req.body.clientPhone || phone, req.body.clientEmail || '']);

      res.json({ 
        success: true, 
        bookingId: result.rows[0].id, 
        reference: ref, 
        checkoutId: checkoutId,
        message: 'STK Push initiated. Please complete payment on your phone.'
      });
    } catch (error) {
      console.error('Booking Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Hubs
  app.get('/api/hubs', async (req, res) => {
    try {
      const result = await query('SELECT * FROM hubs ORDER BY name ASC');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Track Parcel
  app.get('/api/parcels/track/:number', async (req, res) => {
    const { number } = req.params;
    try {
      const result = await query(`
        SELECT p.*, h_o.name as origin_hub, h_d.name as dest_hub
        FROM parcels p
        LEFT JOIN hubs h_o ON p.origin_hub_id = h_o.id
        LEFT JOIN hubs h_d ON p.destination_hub_id = h_d.id
        WHERE p.tracking_number = $1
      `, [number.toUpperCase()]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Tracking number not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Parcels
  app.post('/api/parcels', async (req, res) => {
    const { 
      senderId, senderName, senderPhone, senderEmail,
      receiverName, receiverPhone, receiverEmail,
      originHubId, destinationHubId, 
      description, weight, fee, isFragile 
    } = req.body;
    
    const tracking = 'TRK-' + Math.random().toString(36).substring(2, 9).toUpperCase();
    try {
      // 1. Initiate M-Pesa STK Push
      const cleanPhone = (senderPhone || '').replace(/\+/g, '').replace(/^0/, '254');
      const mpesaResponse = await initiateStkPush(cleanPhone, fee, tracking);
      const checkoutId = mpesaResponse.CheckoutRequestID;

      // 2. Create Parcel with pending payment status and checkout ID
      const result = await query(`
        INSERT INTO parcels (
          sender_id, sender_name, sender_phone, sender_email,
          receiver_name, receiver_phone, receiver_email,
          origin_hub_id, destination_hub_id, 
          description, weight_kg, price, tracking_number, is_fragile, mpesa_checkout_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id
      `, [
        senderId || null, senderName, senderPhone, senderEmail || null,
        receiverName, receiverPhone, receiverEmail || null,
        originHubId, destinationHubId, 
        description, weight, fee, tracking, isFragile || false, checkoutId
      ]);

      // Dispatch Notification (Mock)
      await query(`
        INSERT INTO notifications (type, recipient, message)
        VALUES ($1, $2, $3)
      `, ['SMS', receiverPhone, `Great Rift Shuttle: Parcel ${tracking} has been booked for you. Tracking active.`]);

      res.json({ 
        success: true, 
        trackingNumber: tracking, 
        id: result.rows[0].id,
        checkoutId: checkoutId,
        message: 'STK Push initiated. Please complete payment on your phone.'
      });
    } catch (error) {
      console.error('Parcel Error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Admin: Get all data
  app.get('/api/admin/stats', async (req, res) => {
    try {
      const totalUsers = await query('SELECT COUNT(*) as count FROM users');
       const totalBookings = await query('SELECT COUNT(*) as count FROM bookings');
       const totalRevenue = await query('SELECT SUM(fare_paid) as sum FROM bookings');
       const activeVehicles = await query('SELECT COUNT(*) as count FROM vehicles WHERE status = $1', ['active']);
       const totalDrivers = await query('SELECT COUNT(*) as count FROM drivers');
       const totalHubs = await query('SELECT COUNT(*) as count FROM hubs');
       const recentBookings = await query(`
         SELECT b.*, s.departure_time, r.origin, r.destination, s.id as schedule_id
         FROM bookings b
         JOIN schedules s ON b.schedule_id = s.id
         JOIN routes r ON s.route_id = r.id
         ORDER BY b.created_at DESC
         LIMIT 5
       `);
       
       res.json({
         totalUsers: parseInt(totalUsers.rows[0].count),
         totalBookings: parseInt(totalBookings.rows[0].count),
         totalRevenue: parseFloat(totalRevenue.rows[0].sum || 0),
         activeBuses: parseInt(activeVehicles.rows[0].count),
         totalDrivers: parseInt(totalDrivers.rows[0].count),
         totalHubs: parseInt(totalHubs.rows[0].count),
         recentBookings: recentBookings.rows.map(b => ({
            ...b,
            passenger_name: b.client_name || 'Guest Traveler',
            passenger_email: b.client_email || 'guest@dispatch.grs'
        }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      configFile: 'config.js'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
