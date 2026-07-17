import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import {
  getAllBrandings,
  getBranding,
  getBrandingByDomain,
  getBrandingsByTenant,
  createBranding,
  updateBranding,
  uploadLogo,
  uploadFavicon,
  uploadBanner,
  deleteBranding,
} from '../controllers/brandingController.js';

const router = express.Router();

// ── Rutas públicas ──────────────────────────────────────────────────────────
// Detectar branding por dominio (multi-plataforma)
// Debe estar ANTES de /:tenant para no ser capturada por ese parámetro
router.get('/by-domain', getBrandingByDomain);

// Listar todas las BUs activas de un tenant
router.get('/:tenant', getBrandingsByTenant);

// Obtener branding de una BU específica
router.get('/:tenant/:businessUnit', getBranding);

// ── Rutas admin ─────────────────────────────────────────────────────────────
// Listar todos los brandings (todos los tenants)
router.get('/', authenticateToken, requireRole(['admin']), getAllBrandings);

// Crear BU dentro de un tenant
router.post('/:tenant', authenticateToken, requireRole(['admin']), createBranding);

// Actualizar datos de texto/colores de una BU
router.put('/:tenant/:businessUnit', authenticateToken, requireRole(['admin']), updateBranding);

// Subir assets de branding (Cloudinary, public_id fijo por tenant/BU)
//   POST /api/branding/:tenant/:businessUnit/logo     → tenants/{tenant}/{bu}/branding/logo
//   POST /api/branding/:tenant/:businessUnit/favicon  → tenants/{tenant}/{bu}/branding/favicon
//   POST /api/branding/:tenant/:businessUnit/banner   → tenants/{tenant}/{bu}/branding/banner
router.post('/:tenant/:businessUnit/logo', authenticateToken, requireRole(['admin']), ...uploadLogo);
router.post('/:tenant/:businessUnit/favicon', authenticateToken, requireRole(['admin']), ...uploadFavicon);
router.post('/:tenant/:businessUnit/banner', authenticateToken, requireRole(['admin']), ...uploadBanner);

// Eliminar BU y sus assets de Cloudinary
router.delete('/:tenant/:businessUnit', authenticateToken, requireRole(['admin']), deleteBranding);

export default router;
