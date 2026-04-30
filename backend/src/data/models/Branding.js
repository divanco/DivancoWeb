import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

/**
 * Modelo Branding — multi-tenant / multi-plataforma
 *
 * Estructura Cloudinary equivalente a Azure Blob:
 *   Azure Blob:   Container `tenant-{slug}` / blob `branding/logo.png`
 *   Cloudinary:   public_id `tenants/{slug}/branding/logo`  (overwrite: true)
 *
 * La URL del logo/favicon NUNCA cambia al reemplazar el asset,
 * porque Cloudinary sobreescribe el mismo public_id.
 */
class Branding extends Model {}

Branding.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },

  // ── Organización padre ────────────────────────────────────────────────
  // Un tenant puede tener N unidades de negocio, cada una con su propio logo.
  // Ejemplo: tenant "grupo-divanco" → BUs: "divanco-arquitectura", "divanco-inmobiliaria"
  // Equivale al nivel de "Resource Group" en Azure; el Container sería el businessUnit.
  tenant: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'tenant',
    validate: {
      is: /^[a-z0-9-]+$/i,
    },
  },

  // Identificador único de la unidad de negocio dentro del tenant
  // Cloudinary public_id: tenants/{tenant}/{businessUnit}/branding/{asset}
  businessUnit: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'business_unit',
    validate: {
      is: /^[a-z0-9-]+$/i, // solo letras, números y guiones
    },
  },

  // Nombre visible de la unidad de negocio
  displayName: {
    type: DataTypes.STRING(200),
    allowNull: false,
    field: 'display_name',
  },

  // ── Imágenes de branding ────────────────────────────────────────────────
  // Cloudinary public_id: tenants/{businessUnit}/branding/logo
  // URL fija: cambia el contenido pero nunca la URL (overwrite: true)
  logoUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'logo_url',
  },
  logoPublicId: {
    type: DataTypes.STRING(300),
    allowNull: true,
    field: 'logo_public_id',
  },

  faviconUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'favicon_url',
  },
  faviconPublicId: {
    type: DataTypes.STRING(300),
    allowNull: true,
    field: 'favicon_public_id',
  },

  // Banner/hero por unidad de negocio (opcional)
  bannerUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'banner_url',
  },
  bannerPublicId: {
    type: DataTypes.STRING(300),
    allowNull: true,
    field: 'banner_public_id',
  },

  // ── Colores de marca ────────────────────────────────────────────────────
  primaryColor: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#000000',
    field: 'primary_color',
  },
  secondaryColor: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#ffffff',
    field: 'secondary_color',
  },
  accentColor: {
    type: DataTypes.STRING(20),
    allowNull: true,
    defaultValue: '#ff6b35',
    field: 'accent_color',
  },

  // ── Tipografía ──────────────────────────────────────────────────────────
  fontPrimary: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: 'Inter',
    field: 'font_primary',
  },

  // ── Metadatos del sitio ─────────────────────────────────────────────────
  siteTitle: {
    type: DataTypes.STRING(200),
    allowNull: true,
    field: 'site_title',
  },
  siteDescription: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'site_description',
  },

  // Dominio asociado a esta unidad de negocio (para multi-plataforma)
  domain: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
  },

  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active',
  },
}, {
  sequelize,
  modelName: 'Branding',
  tableName: 'Brandings',
  timestamps: true,
  underscored: false,
  indexes: [
    // Un tenant puede tener múltiples BUs, pero cada BU es única dentro del tenant
    { unique: true, fields: ['tenant', 'business_unit'] },
    { fields: ['tenant'] },
    { fields: ['domain'] },
  ],
});

export default Branding;
