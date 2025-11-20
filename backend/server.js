import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import itemsRouter from './routes/items.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';

dotenv.config();
const app = express();

app.use(cors({
  origin: "http://localhost:5173"  // frontend URL
}));
app.use(express.json());

app.use('/api/items', itemsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
