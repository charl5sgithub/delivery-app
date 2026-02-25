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
  origin: process.env.FRONTEND_URL || "http://localhost:5173"
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
