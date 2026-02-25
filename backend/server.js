import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import itemsRouter from './routes/items.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';
import customersRouter from './routes/customers.js';
import deliveryRouter from './routes/delivery.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: (origin, callback) => {
    // 1. Define allowed origins (Local + Production)
    const allowed = [
      "http://localhost:5173",
      process.env.FRONTEND_URL?.replace(/\/$/, "")
    ].filter(Boolean);

    // 2. Log for Vercel Dashboard debugging
    console.log("CORS Check - Incoming Origin:", origin);
    console.log("CORS Check - Static Allowed:", allowed);

    // 3. Robust condition: Exact match OR any Vercel subdomain (for branch/preview URLs)
    if (!origin || allowed.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      console.error("CORS BLOCKED:", origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/items', itemsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/delivery', deliveryRouter);

// Export for Vercel
export default app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}
