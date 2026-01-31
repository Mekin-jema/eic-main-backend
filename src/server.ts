
import cookieParser from 'cookie-parser';
import fs from 'fs';
import cors from 'cors';
import express from 'express';
import { Dbconnection } from './Config/DbConfig';
import rootRoutes from './Routes/index';
import dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

// CORS configuration (allow frontend dev origins and credentials)
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://eic-admin-seven.vercel.app',
    'https://eic-frontend.vercel.app',
];

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser requests (like curl/postman) with no Origin
        if (!origin) return callback(null, true);
        const normalized = origin.replace(/\/$/, '');
        if (allowedOrigins.includes(normalized)) {
            return callback(null, true);
        }
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
};

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(express.json())

app.use(cors(corsOptions));
// Explicitly handle preflight requests for all routes without wildcard pattern
app.use((req, res, next) => {
    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

app.use(cookieParser());

// Simple request and response logging middleware
app.use((req, res, next) => {
    const start = Date.now();
    const timestamp = new Date().toISOString();

    // Log request details including body
    const requestInfo = {
        method: req.method,
        path: req.path,
        body: req.body,
        query: req.query,
        params: req.params
    };

    console.log(`[${timestamp}] ${req.method} ${req.path} - Incoming request`);
    console.log(`[${timestamp}] Request Body:`, JSON.stringify(requestInfo.body, null, 2));
    if (Object.keys(requestInfo.query).length > 0) {
        console.log(`[${timestamp}] Query Params:`, JSON.stringify(requestInfo.query, null, 2));
    }
    if (Object.keys(requestInfo.params).length > 0) {
        console.log(`[${timestamp}] Route Params:`, JSON.stringify(requestInfo.params, null, 2));
    }

    // Log response when it finishes
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${timestamp}] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });

    next();
});

// Serve static files
// Ensure uploads directory exists
try {
    fs.mkdirSync('public/uploads/attendees', { recursive: true });
} catch {}

app.use(express.static('public'));

app.use('/api', rootRoutes);
app.get('/', (req, res) => {
    res.send('EIC Backend is running');
});

Dbconnection()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Database connection error:', error.message);
    });
