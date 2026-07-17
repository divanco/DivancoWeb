import { SiteSetting } from '../data/models/index.js';
import {
  uploadHeroMediaMiddleware,
  uploadResponsiveImage,
  uploadHeroVideo,
} from '../config/cloudinary.js';
import { promises as fs } from 'fs';

const HERO_MEDIA_KEY = 'hero_image_url';

const parseHeroMedia = (rawValue) => {
  if (!rawValue) return { url: null, type: null };

  // Compatibilidad: valores antiguos eran solo la URL (string)
  if (rawValue.startsWith('http') || rawValue.startsWith('/')) {
    return { url: rawValue, type: 'image' };
  }

  try {
    const parsed = JSON.parse(rawValue);
    if (parsed?.url) {
      return {
        url: parsed.url,
        type: parsed.type === 'video' ? 'video' : 'image',
      };
    }
  } catch {
    // valor no JSON — tratar como URL de imagen
  }

  return { url: rawValue, type: 'image' };
};

const parseHeroUpload = (req, res, next) => {
  uploadHeroMediaMiddleware.single('media')(req, res, (err) => {
    if (err) {
      console.error('❌ [HeroMedia] Multer error:', err.message);
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      return res.status(status).json({
        success: false,
        message:
          err.code === 'LIMIT_FILE_SIZE'
            ? 'El archivo supera el tamaño máximo permitido (100MB)'
            : err.message || 'Archivo no válido',
      });
    }
    next();
  });
};

// GET /settings/hero-image — público
export const getHeroImage = async (req, res) => {
  try {
    const setting = await SiteSetting.findOne({ where: { key: HERO_MEDIA_KEY } });
    const media = parseHeroMedia(setting?.value || null);
    res.json({
      success: true,
      data: media,
    });
  } catch (error) {
    console.error('Error obteniendo hero media:', error);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// PUT /settings/hero-image — solo admin (imagen o video)
export const updateHeroImage = [
  parseHeroUpload,
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere una imagen o un video',
      });
    }

    const isVideo = req.file.mimetype.startsWith('video/');
    console.log(
      `📤 [HeroMedia] Recibido ${isVideo ? 'video' : 'imagen'}:`,
      req.file.originalname,
      `${(req.file.size / (1024 * 1024)).toFixed(2)}MB`,
      req.file.mimetype
    );

    try {
      let url;
      let type;

      if (isVideo) {
        const result = await uploadHeroVideo(req.file.path, 'site-settings/hero');
        url = result.url;
        type = 'video';
      } else {
        const result = await uploadResponsiveImage(req.file.path, 'site-settings/hero');
        url = result.desktop.url;
        type = 'image';
      }

      await fs.unlink(req.file.path).catch(() => {});

      const payload = JSON.stringify({ url, type });
      await SiteSetting.upsert({ key: HERO_MEDIA_KEY, value: payload });

      console.log('✅ [HeroMedia] Guardado:', { type, url });
      res.json({ success: true, data: { url, type } });
    } catch (error) {
      await fs.unlink(req.file?.path).catch(() => {});
      console.error('Error subiendo hero media:', error);
      res.status(500).json({
        success: false,
        message: isVideo
          ? `Error al subir el video: ${error.message}`
          : `Error al subir la imagen: ${error.message}`,
      });
    }
  },
];
