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
  origin: [
    'https://divanco-web.vercel.app',
    'http://localhost:5173'
  ],
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ MIDDLEWARE CONDICIONAL - NO parsear JSON en rutas de upload
app.use((req, res, next) => {
  // Excluir rutas que manejan archivos del parsing JSON
  if (req.path.includes('/media') || req.path.includes('/upload')) {
    console.log('🚫 Saltando JSON parsing para:', req.path);
    return next();
  }
  
  // Para todas las demás rutas, aplicar JSON parsing
  express.json({ limit: '10mb' })(req, res, next);
});

app.use((req, res, next) => {
  // Excluir rutas que manejan archivos del parsing URL-encoded
  if (req.path.includes('/media') || req.path.includes('/upload')) {
    return next();
  }
  
  express.urlencoded({ limit: '10mb', extended: true })(req, res, next);
});

// ✅ Static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads/')));


// ✅ Servir archivos estáticos del frontend (ahora en backend/dist)
app.use(express.static(path.join(process.cwd(), 'dist')));

app.get('/', (req, res) => {
  res.send('Backend Divanco Running 🏗️');
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

// SPA fallback: servir index.html para cualquier ruta que no sea archivo subido ni estático
import fs from 'fs';


const frontendDist = path.join(process.cwd(), 'dist');
const indexHtml = path.join(frontendDist, 'index.html');
console.log('🟢 [SERVER] frontendDist:', frontendDist);
console.log('🟢 [SERVER] indexHtml:', indexHtml);
import fs from 'fs';
if (fs.existsSync(indexHtml)) {
  console.log('✅ [SERVER] index.html encontrado');
} else {
  console.error('❌ [SERVER] index.html NO encontrado');
}

app.get('*', (req, res, next) => {
  // Si la ruta es para archivos subidos, no hacer fallback
  if (req.path.startsWith('/uploads')) return next();
  // Si la ruta es para un archivo estático existente, no hacer fallback
  const filePath = path.join(frontendDist, req.path);
  if (fs.existsSync(filePath) && fs.lstatSync(filePath).isFile()) return res.sendFile(filePath);
  // Fallback: servir index.html
  res.sendFile(indexHtml);
});

// 404 handler (solo si no existe ni como archivo ni como ruta)
app.use('*', (req, res) => {
  res.status(404).json({ error: true, message: 'Route not found' });
});

// Error handler
import errorHandler from './middlewares/errorHandler.js';
app.use(errorHandler);

export default app;