export async function up(queryInterface, Sequelize) {
  const tables = await queryInterface.showAllTables();
  if (tables.includes('SiteSettings')) {
    console.log('✅ Tabla SiteSettings ya existe, omitiendo...');
    return;
  }

  await queryInterface.createTable('SiteSettings', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    key: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    value: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  console.log('✅ Tabla SiteSettings creada');
}

export async function down(queryInterface) {
  await queryInterface.dropTable('SiteSettings');
}
