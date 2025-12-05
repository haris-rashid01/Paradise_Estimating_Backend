import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: [
    "http://localhost:3000",
    "http://localhost:8080",
    "http://192.168.100.132:8080"
  ],
  credentials: true
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("combined"));

//Routes
app.use('/api', contactRoutes);

app.use(morgan("combined"));

app.get('/health', (req, res) => res.json({ status: "OK" }));

export default app;
