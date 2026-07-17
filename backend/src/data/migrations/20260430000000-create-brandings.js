'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Brandings', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },

      // Slug del tenant (organización / empresa madre)
      // Equivale al Resource Group en Azure
      tenant: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      // Slug de la unidad de negocio dentro del tenant
      // Equivale al nombre del Container en Azure Blob
      // Único SOLO dentro del mismo tenant → índice compuesto (tenant, business_unit)
      business_unit: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },

      display_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },

      // Assets en Cloudinary — public_id: tenants/{tenant}/{business_unit}/branding/{tipo}
      logo_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      logo_public_id: {
        type: Sequelize.STRING(300),
        allowNull: true,
      },

      favicon_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      favicon_public_id: {
        type: Sequelize.STRING(300),
        allowNull: true,
      },

      banner_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      banner_public_id: {
        type: Sequelize.STRING(300),
        allowNull: true,
      },

      // Colores de marca
      primary_color: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: '#000000',
      },
      secondary_color: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: '#ffffff',
      },
      accent_color: {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: '#ff6b35',
      },

      // Tipografía
      font_primary: {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'Inter',
      },

      // Metadatos del sitio
      site_title: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      site_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      // Dominio asociado (para multi-plataforma: acme.tuapp.com)
      domain: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true,
      },

      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },

      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Índice compuesto único: un businessUnit es único dentro de su tenant
    await queryInterface.addIndex('Brandings', ['tenant', 'business_unit'], {
      name: 'brandings_tenant_bu_unique_idx',
      unique: true,
    });
    // Índice para listar todas las BUs de un tenant
    await queryInterface.addIndex('Brandings', ['tenant'], { name: 'brandings_tenant_idx' });
    // Índice para búsqueda por dominio (multi-plataforma)
    await queryInterface.addIndex('Brandings', ['domain'], { name: 'brandings_domain_idx' });
    await queryInterface.addIndex('Brandings', ['is_active'], { name: 'brandings_is_active_idx' });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Brandings');
  },
};
