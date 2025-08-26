import { Product, Subcategory, Category } from '../data/models/index.js';
import { uploadResponsiveImage, deleteResponsiveImages } from '../config/cloudinary.js';
import { generateSlug } from '../utils/slugify.js';
import { Op } from 'sequelize';

// Obtener todos los productos con filtros
export const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      subcategoryId,
      categoryId,
      search,
      featured,
      isNew,
      brand,
      sortBy = 'order',
      sortOrder = 'ASC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { isActive: true };

    // Filtros
    if (subcategoryId) where.subcategoryId = subcategoryId;
    if (featured === 'true') where.isFeatured = true;
    if (isNew === 'true') where.isNew = true;
    if (brand) where.brand = { [Op.iLike]: `%${brand}%` };
    
    if (search) {
      where.searchableText = { [Op.iLike]: `%${search.toLowerCase()}%` };
    }

    // Incluir filtro por categoría a través de subcategoría
    const include = [
      {
        model: Subcategory,
        as: 'subcategory',
        include: [
          {
            model: Category,
            as: 'category'
          }
        ],
        ...(categoryId && { where: { categoryId } })
      }
    ];

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include,
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener producto por slug
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await Product.findOne({
      where: { slug, isActive: true },
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          include: [
            {
              model: Category,
              as: 'category'
            }
          ]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Incrementar contador de vistas
    await product.increment('viewCount');

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Crear nuevo producto
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      subcategoryId,
      brand,
      model,
      sku,
      specifications,
      whatsappMessage,
      price,
      currency,
      order,
      isFeatured,
      isNew,
      metaTitle,
      metaDescription
    } = req.body;

    // Validaciones básicas
    if (!name || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'El nombre es requerido y debe tener al menos 2 caracteres'
      });
    }

    if (!subcategoryId) {
      return res.status(400).json({
        success: false,
        message: 'La subcategoría es requerida'
      });
    }

    // Validar que la subcategoría existe
    const subcategory = await Subcategory.findByPk(subcategoryId);
    if (!subcategory) {
      return res.status(400).json({
        success: false,
        message: 'Subcategoría no encontrada'
      });
    }

    const productData = {
      name: name.trim(),
      slug: generateSlug(name.trim()),
      description: description?.trim(),
      subcategoryId,
      brand: brand?.trim(),
      model: model?.trim(),
      sku: sku?.trim(),
      specifications: specifications || {},
      whatsappMessage: whatsappMessage?.trim(),
      price: price ? parseFloat(price) : null,
      currency: currency || 'USD',
      order: parseInt(order) || 0,
      isFeatured: Boolean(isFeatured),
      isNew: Boolean(isNew),
      metaTitle: metaTitle?.trim(),
      metaDescription: metaDescription?.trim()
    };

    const product = await Product.create(productData);

    // Incluir relaciones en la respuesta
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          include: [
            {
              model: Category,
              as: 'category'
            }
          ]
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: { product: createdProduct }
    });

  } catch (error) {
    console.error('Error al crear producto:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un producto con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Actualizar producto
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Validar subcategoría si se está actualizando
    if (updateData.subcategoryId) {
      const subcategory = await Subcategory.findByPk(updateData.subcategoryId);
      if (!subcategory) {
        return res.status(400).json({
          success: false,
          message: 'Subcategoría no encontrada'
        });
      }
    }

    // Si se está actualizando el nombre, generar nuevo slug
    if (updateData.name && updateData.name.trim() !== product.name) {
      updateData.slug = generateSlug(updateData.name.trim());
    }

    await product.update(updateData);

    // Obtener producto actualizado con relaciones
    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          include: [
            {
              model: Category,
              as: 'category'
            }
          ]
        }
      ]
    });

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: { product: updatedProduct }
    });

  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Subir imagen de producto
export const uploadProductImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'gallery' } = req.body; // 'featured' o 'gallery'

    const files = req.files && req.files.length > 0 ? req.files : (req.file ? [req.file] : []);
    
    if (!files.length) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ningún archivo'
      });
    }

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    const folder = `products/${new Date().getFullYear()}/${product.slug}`;
    let newImages = [];
    
    for (const file of files) {
      const img = await uploadResponsiveImage(file.path, folder);
      newImages.push(img);
    }

    let updateData = {};
    
    if (type === 'featured') {
      // Eliminar imagen destacada anterior si existe
      if (product.featuredImage) {
        try {
          await deleteResponsiveImages(product.featuredImage);
        } catch (deleteError) {
          console.warn('Error eliminando imagen anterior:', deleteError);
        }
      }
      updateData.featuredImage = newImages[0];
    } else if (type === 'gallery') {
      // Agregar a galería existente
      const currentImages = product.images || [];
      updateData.images = [...currentImages, ...newImages];
    }

    await product.update(updateData);

    res.json({
      success: true,
      message: 'Imagen(es) subida(s) exitosamente',
      data: {
        product: product,
        newImages: newImages
      }
    });

  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar imagen de producto
export const deleteProductImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    if (imageId === 'featured') {
      // Eliminar imagen destacada
      if (product.featuredImage) {
        try {
          await deleteResponsiveImages(product.featuredImage);
        } catch (deleteError) {
          console.warn('Error eliminando imagen:', deleteError);
        }
      }
      await product.update({ featuredImage: null });
    } else {
      // Eliminar de galería
      const currentImages = product.images || [];
      const imageIndex = parseInt(imageId);
      
      if (imageIndex >= 0 && imageIndex < currentImages.length) {
        const imageToDelete = currentImages[imageIndex];
        
        try {
          await deleteResponsiveImages(imageToDelete);
        } catch (deleteError) {
          console.warn('Error eliminando imagen:', deleteError);
        }
        
        const updatedImages = currentImages.filter((_, index) => index !== imageIndex);
        await product.update({ images: updatedImages });
      }
    }

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar producto
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado'
      });
    }

    // Eliminar imágenes de Cloudinary
    if (product.featuredImage) {
      try {
        await deleteResponsiveImages(product.featuredImage);
      } catch (deleteError) {
        console.warn('Error eliminando imagen destacada:', deleteError);
      }
    }

    if (product.images && product.images.length > 0) {
      try {
        for (const imageSet of product.images) {
          await deleteResponsiveImages(imageSet);
        }
      } catch (deleteError) {
        console.warn('Error eliminando galería:', deleteError);
      }
    }

    await product.destroy();

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando producto:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Obtener productos destacados
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;

    const products = await Product.findAll({
      where: { 
        isActive: true, 
        isFeatured: true 
      },
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          include: [
            {
              model: Category,
              as: 'category'
            }
          ]
        }
      ],
      order: [['order', 'ASC'], ['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: { products }
    });

  } catch (error) {
    console.error('Error al obtener productos destacados:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener productos por subcategoría
export const getProductsBySubcategory = async (req, res) => {
  try {
    const { subcategorySlug } = req.params;
    const { page = 1, limit = 12, sortBy = 'order', sortOrder = 'ASC' } = req.query;

    const offset = (page - 1) * limit;

    // Buscar subcategoría por slug
    const subcategory = await Subcategory.findOne({
      where: { slug: subcategorySlug, isActive: true },
      include: [
        {
          model: Category,
          as: 'category'
        }
      ]
    });

    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'Subcategoría no encontrada'
      });
    }

    // Obtener productos de la subcategoría
    const { count, rows: products } = await Product.findAndCountAll({
      where: { 
        subcategoryId: subcategory.id,
        isActive: true 
      },
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          include: [
            {
              model: Category,
              as: 'category'
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    res.json({
      success: true,
      data: {
        subcategory,
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener productos por subcategoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener productos por categoría
export const getProductsByCategory = async (req, res) => {
  try {
    const { categorySlug } = req.params;
    const { page = 1, limit = 12, sortBy = 'order', sortOrder = 'ASC' } = req.query;

    const offset = (page - 1) * limit;

    // Buscar categoría por slug
    const category = await Category.findOne({
      where: { slug: categorySlug, isActive: true }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Obtener productos de la categoría (a través de subcategorías)
    const { count, rows: products } = await Product.findAndCountAll({
      where: { 
        isActive: true 
      },
      include: [
        {
          model: Subcategory,
          as: 'subcategory',
          where: { categoryId: category.id, isActive: true },
          include: [
            {
              model: Category,
              as: 'category'
            }
          ]
        }
      ],
      limit: parseInt(limit),
      offset,
      order: [[sortBy, sortOrder.toUpperCase()]],
    });

    res.json({
      success: true,
      data: {
        category,
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};
