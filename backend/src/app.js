import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import nodemailer from 'nodemailer';
import morgan from 'morgan';
import routes from './routes/index.js';

// Configurar zona horaria
process.env.TZ = 'America/Bogota';
console.log('🇨🇴 [SERVER] Zona horaria configurada:', process.env.TZ);
console.log('✅ [SERVER] CORS: grupodivanco.com / .co → API Render');
console.log('🕐 [SERVER] Hora actual Colombia:', new Date().toLocaleString('es-CO', {
  timeZone: 'America/Bogota',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
}));

// ✅ CARGAR .env ANTES de importar modelos
dotenv.config();
import './data/models/index.js';

const app = express();

// ✅ MIDDLEWARES EN EL ORDEN CORRECTO
app.use(morgan('dev'));

// ✅ CONFIGURAR CORS PRIMERO
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (como mobile apps o curl)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://www.grupodivanco.com',
      'https://grupodivanco.com',
      'https://www.grupodivanco.co',
      'https://grupodivanco.co',
      'https://divanco-web.vercel.app',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
    ].filter(Boolean);

    // Previews de Vercel del proyecto (divanco-*)
    const isVercelPreview = /^https:\/\/divanco[a-z0-9-]*\.vercel\.app$/.test(origin);

    if (allowedOrigins.includes(origin) || isVercelPreview) {
      return callback(null, true);
    }

    // Importante: NO lanzar Error (eso se convierte en HTTP 500).
    // callback(null, false) deniega CORS sin tumbar el request como error de servidor.
    console.warn('🚫 CORS blocked origin:', origin);
    return callback(null, false);
  },
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with'],
  credentials: true
}));

const isMultipartUploadPath = (path) =>
  path.includes('/media') ||
  path.includes('/upload') ||
  path.includes('/hero-image');

// ✅ MIDDLEWARE CONDICIONAL - NO parsear JSON en rutas de upload
app.use((req, res, next) => {
  if (isMultipartUploadPath(req.path)) {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, next);
});

app.use((req, res, next) => {
  if (isMultipartUploadPath(req.path)) {
    return next();
  }
  express.urlencoded({ limit: '10mb', extended: true })(req, res, next);
});

// ✅ Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads/')));


// NOTE: frontend now hosted separately (Azure Static Web Apps).
// Static serving from backend/dist is disabled to avoid trying to access /app/dist inside the container.
// app.use(express.static(path.join(process.cwd(), 'dist')));

app.get('/', (req, res) => {
  res.send('Backend Divanco Running 🏗️');
});

// Health endpoint used by deployment checks
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend is healthy', 
    version: '1.2.0-fix-images-persistence', // 👈 Esta es la marca que buscaremos
    timestamp: new Date().toISOString() 
  });
});

// Ejemplo de endpoint para enviar email
import { sendMail } from './utils/mailer.js';

app.post('/send-email', async (req, res, next) => {
  try {
    const info = await sendMail({
      to: req.body.to,
      subject: req.body.subject,
      text: req.body.text,
      html: req.body.html,
      from: req.body.from,
    });
    res.json({ success: true, info });
  } catch (error) {
    next(error);
  }
});

// ✅ ENDPOINT DE UPLOAD SIMPLE (para testing)
const testUpload = multer({ 
  dest: path.join(process.cwd(), 'uploads/'),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

app.post('/upload', testUpload.single('file'), (req, res) => {
  console.log('📁 Test upload:', req.file);
  res.json({ success: true, file: req.file });
});

// ✅ RUTAS PRINCIPALES (después de middlewares básicos)

app.use(routes);

// SPA fallback removed: frontend is served by Azure Static Web Apps. Backend only serves API routes and uploads.

// 404 handler (solo si no existe ni como archivo ni como ruta)
app.use('*', (req, res) => {
  res.status(404).json({ error: true, message: 'Route not found' });
});

// Error handler
import errorHandler from './middlewares/errorHandler.js';
app.use(errorHandler);

export default app;