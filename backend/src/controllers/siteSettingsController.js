import { SiteSetting } from '../data/models/index.js';
import {
  uploadHeroMediaMiddleware,
  uploadResponsiveImage,
  uploadOptimizedVideo,
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
  uploadHeroMediaMiddleware.single('media'),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere una imagen o un video',
      });
    }

    const isVideo = req.file.mimetype.startsWith('video/');

    try {
      let url;
      let type;

      if (isVideo) {
        const result = await uploadOptimizedVideo(req.file.path, 'site-settings/hero');
        url = result.url;
        type = 'video';
      } else {
        const result = await uploadResponsiveImage(req.file.path, 'site-settings/hero');
        // uploadResponsiveImage ya elimina el temp
        url = result.desktop.url;
        type = 'image';
      }

      await fs.unlink(req.file.path).catch(() => {});

      const payload = JSON.stringify({ url, type });
      await SiteSetting.upsert({ key: HERO_MEDIA_KEY, value: payload });

      res.json({ success: true, data: { url, type } });
    } catch (error) {
      await fs.unlink(req.file?.path).catch(() => {});
      console.error('Error subiendo hero media:', error);
      res.status(500).json({
        success: false,
        message: isVideo ? 'Error al subir el video' : 'Error al subir la imagen',
      });
    }
  },
];
