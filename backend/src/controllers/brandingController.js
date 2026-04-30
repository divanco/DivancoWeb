import { v2 as cloudinary } from 'cloudinary';
import { Branding } from '../data/models/index.js';
import { uploadImageMiddleware } from '../config/cloudinary.js';
import { promises as fs } from 'fs';

/**
 * BrandingController — Multi-tenant / Multi-plataforma con Cloudinary
 *
 * Jerarquía:
 *   Tenant       = organización / empresa madre  (ej: "grupo-divanco")
 *   BusinessUnit = marca / división dentro del tenant (ej: "divanco-arquitectura")
 *
 * Un tenant puede tener N unidades de negocio, cada una con su propio logo.
 *
 * Estructura Cloudinary (equivalente a Azure Blob):
 *   Azure Blob:
 *     Resource Group: grupo-divanco
 *     Container:      divanco-arquitectura   (una por BU)
 *     Blob:           branding/logo.png
 *
 *   Cloudinary:
 *     public_id: tenants/{tenant}/{businessUnit}/branding/logo    ← FIJO, overwrite:true
 *     public_id: tenants/{tenant}/{businessUnit}/branding/favicon
 *     public_id: tenants/{tenant}/{businessUnit}/branding/banner
 *
 * La URL del logo NUNCA cambia al reemplazarlo. No hay cache-busting.
 */

// ── Helpers internos ────────────────────────────────────────────────────────

/**
 * Sube un asset a Cloudinary con public_id fijo por tenant/BU.
 * @param {string} filePath     - Ruta temporal (multer)
 * @param {string} tenant       - Slug del tenant (ej: "grupo-divanco")
 * @param {string} businessUnit - Slug de la BU (ej: "divanco-arquitectura")
 * @param {string} assetType    - "logo" | "favicon" | "banner"
 */
const uploadBrandingAsset = async (filePath, tenant, businessUnit, assetType) => {
  const publicId = `tenants/${tenant}/${businessUnit}/branding/${assetType}`;

  const result = await cloudinary.uploader.upload(filePath, {
    public_id: publicId,
    overwrite: true,
    invalidate: true,
    resource_type: 'image',
    format: 'webp',
    transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
    tags: ['branding', tenant, businessUnit, assetType],
  });

  await fs.unlink(filePath).catch(() => {});

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    bytes: result.bytes,
    format: result.format,
  };
};

const deleteBrandingAsset = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    console.warn(`[BrandingController] No se pudo eliminar ${publicId}:`, err.message);
  }
};

// ── GET /api/branding ───────────────────────────────────────────────────────
export const getAllBrandings = async (req, res) => {
  try {
    const brandings = await Branding.findAll({
      order: [['tenant', 'ASC'], ['displayName', 'ASC']],
    });
    res.json({ success: true, data: brandings });
  } catch (error) {
    console.error('[BrandingController] Error listando brandings:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// ── GET /api/branding/by-domain ────────────────────────────────────────────
export const getBrandingByDomain = async (req, res) => {
  try {
    const host = req.hostname;
    const branding = await Branding.findOne({ where: { domain: host, isActive: true } });

    if (!branding) {
      const defaultBranding = await Branding.findOne({ where: { isActive: true }, order: [['id', 'ASC']] });
      return res.json({ success: true, data: defaultBranding, isDefault: true });
    }

    res.json({ success: true, data: branding, isDefault: false });
  } catch (error) {
    console.error('[BrandingController] Error obteniendo branding por dominio:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// ── GET /api/branding/:tenant ──────────────────────────────────────────────
// Lista todas las BUs activas de un tenant
export const getBrandingsByTenant = async (req, res) => {
  try {
    const { tenant } = req.params;
    const brandings = await Branding.findAll({
      where: { tenant, isActive: true },
      order: [['displayName', 'ASC']],
    });
    res.json({ success: true, data: brandings });
  } catch (error) {
    console.error('[BrandingController] Error listando BUs del tenant:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// ── GET /api/branding/:tenant/:businessUnit ────────────────────────────────
export const getBranding = async (req, res) => {
  try {
    const { tenant, businessUnit } = req.params;
    const branding = await Branding.findOne({ where: { tenant, businessUnit, isActive: true } });

    if (!branding) {
      return res.status(404).json({ success: false, message: 'Unidad de negocio no encontrada' });
    }

    res.json({ success: true, data: branding });
  } catch (error) {
    console.error('[BrandingController] Error obteniendo branding:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// ── POST /api/branding/:tenant ─────────────────────────────────────────────
// Crea una nueva BU dentro del tenant
export const createBranding = async (req, res) => {
  try {
    const { tenant } = req.params;
    const { businessUnit, displayName, primaryColor, secondaryColor, accentColor, fontPrimary, siteTitle, siteDescription, domain } = req.body;

    if (!businessUnit || !displayName) {
      return res.status(400).json({ success: false, message: 'businessUnit y displayName son requeridos' });
    }

    const existing = await Branding.findOne({ where: { tenant, businessUnit } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Ya existe la BU "${businessUnit}" en el tenant "${tenant}"`,
      });
    }

    const branding = await Branding.create({
      tenant,
      businessUnit,
      displayName,
      primaryColor,
      secondaryColor,
      accentColor,
      fontPrimary,
      siteTitle,
      siteDescription,
      domain: domain || null,
    });

    res.status(201).json({ success: true, data: branding });
  } catch (error) {
    console.error('[BrandingController] Error creando branding:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// ── PUT /api/branding/:tenant/:businessUnit ────────────────────────────────
export const updateBranding = async (req, res) => {
  try {
    const { tenant, businessUnit } = req.params;
    const { displayName, primaryColor, secondaryColor, accentColor, fontPrimary, siteTitle, siteDescription, domain, isActive } = req.body;

    const branding = await Branding.findOne({ where: { tenant, businessUnit } });
    if (!branding) {
      return res.status(404).json({ success: false, message: 'Unidad de negocio no encontrada' });
    }

    await branding.update({
      displayName:     displayName     ?? branding.displayName,
      primaryColor:    primaryColor    ?? branding.primaryColor,
      secondaryColor:  secondaryColor  ?? branding.secondaryColor,
      accentColor:     accentColor     ?? branding.accentColor,
      fontPrimary:     fontPrimary     ?? branding.fontPrimary,
      siteTitle:       siteTitle       ?? branding.siteTitle,
      siteDescription: siteDescription ?? branding.siteDescription,
      domain:          domain !== undefined ? domain : branding.domain,
      isActive:        isActive !== undefined ? isActive : branding.isActive,
    });

    res.json({ success: true, data: branding });
  } catch (error) {
    console.error('[BrandingController] Error actualizando branding:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// ── POST /api/branding/:tenant/:businessUnit/logo ──────────────────────────
// Cloudinary: tenants/{tenant}/{businessUnit}/branding/logo (overwrite: true)
export const uploadLogo = [
  uploadImageMiddleware.single('logo'),
  async (req, res) => {
    try {
      const { tenant, businessUnit } = req.params;

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Se requiere un archivo de imagen' });
      }

      const branding = await Branding.findOne({ where: { tenant, businessUnit } });
      if (!branding) {
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(404).json({ success: false, message: 'Unidad de negocio no encontrada' });
      }

      console.log(`[BrandingController] Subiendo logo → tenants/${tenant}/${businessUnit}/branding/logo`);
      const result = await uploadBrandingAsset(req.file.path, tenant, businessUnit, 'logo');
      await branding.update({ logoUrl: result.url, logoPublicId: result.publicId });

      res.json({ success: true, data: { url: result.url, publicId: result.publicId } });
    } catch (error) {
      await fs.unlink(req.file?.path).catch(() => {});
      console.error('[BrandingController] Error uploading logo:', error);
      res.status(500).json({ success: false, message: 'Error al subir el logo' });
    }
  },
];

// ── POST /api/branding/:tenant/:businessUnit/favicon ───────────────────────
export const uploadFavicon = [
  uploadImageMiddleware.single('favicon'),
  async (req, res) => {
    try {
      const { tenant, businessUnit } = req.params;

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Se requiere un archivo de imagen' });
      }

      const branding = await Branding.findOne({ where: { tenant, businessUnit } });
      if (!branding) {
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(404).json({ success: false, message: 'Unidad de negocio no encontrada' });
      }

      const result = await uploadBrandingAsset(req.file.path, tenant, businessUnit, 'favicon');
      await branding.update({ faviconUrl: result.url, faviconPublicId: result.publicId });

      res.json({ success: true, data: { url: result.url, publicId: result.publicId } });
    } catch (error) {
      await fs.unlink(req.file?.path).catch(() => {});
      console.error('[BrandingController] Error uploading favicon:', error);
      res.status(500).json({ success: false, message: 'Error al subir el favicon' });
    }
  },
];

// ── POST /api/branding/:tenant/:businessUnit/banner ────────────────────────
export const uploadBanner = [
  uploadImageMiddleware.single('banner'),
  async (req, res) => {
    try {
      const { tenant, businessUnit } = req.params;

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'Se requiere un archivo de imagen' });
      }

      const branding = await Branding.findOne({ where: { tenant, businessUnit } });
      if (!branding) {
        await fs.unlink(req.file.path).catch(() => {});
        return res.status(404).json({ success: false, message: 'Unidad de negocio no encontrada' });
      }

      const result = await uploadBrandingAsset(req.file.path, tenant, businessUnit, 'banner');
      await branding.update({ bannerUrl: result.url, bannerPublicId: result.publicId });

      res.json({ success: true, data: { url: result.url, publicId: result.publicId } });
    } catch (error) {
      await fs.unlink(req.file?.path).catch(() => {});
      console.error('[BrandingController] Error uploading banner:', error);
      res.status(500).json({ success: false, message: 'Error al subir el banner' });
    }
  },
];

// ── DELETE /api/branding/:tenant/:businessUnit ─────────────────────────────
export const deleteBranding = async (req, res) => {
  try {
    const { tenant, businessUnit } = req.params;

    const branding = await Branding.findOne({ where: { tenant, businessUnit } });
    if (!branding) {
      return res.status(404).json({ success: false, message: 'Unidad de negocio no encontrada' });
    }

    await Promise.all([
      deleteBrandingAsset(branding.logoPublicId),
      deleteBrandingAsset(branding.faviconPublicId),
      deleteBrandingAsset(branding.bannerPublicId),
    ]);

    await branding.destroy();

    res.json({ success: true, message: `BU "${businessUnit}" del tenant "${tenant}" eliminada` });
  } catch (error) {
    console.error('[BrandingController] Error eliminando branding:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
