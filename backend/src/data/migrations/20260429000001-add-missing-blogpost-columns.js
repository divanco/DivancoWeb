import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  const table = await queryInterface.describeTable('BlogPosts');

  if (!table.author) {
    await queryInterface.addColumn('BlogPosts', 'author', {
      type: DataTypes.STRING(100),
      allowNull: true,
    });
    console.log('✅ Columna author agregada a BlogPosts');
  }

  if (!table.metaTitle) {
    await queryInterface.addColumn('BlogPosts', 'metaTitle', {
      type: DataTypes.STRING(200),
      allowNull: true,
    });
    console.log('✅ Columna metaTitle agregada a BlogPosts');
  }

  if (!table.metaDescription) {
    await queryInterface.addColumn('BlogPosts', 'metaDescription', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
    console.log('✅ Columna metaDescription agregada a BlogPosts');
  }
}

export async function down(queryInterface) {
  const table = await queryInterface.describeTable('BlogPosts');
  if (table.metaDescription) await queryInterface.removeColumn('BlogPosts', 'metaDescription');
  if (table.metaTitle) await queryInterface.removeColumn('BlogPosts', 'metaTitle');
  if (table.author) await queryInterface.removeColumn('BlogPosts', 'author');
}
