import express from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/errorHandler';
import authRouter from './routes/auth.router';

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRouter);

app.use(errorHandler);

export default app;
