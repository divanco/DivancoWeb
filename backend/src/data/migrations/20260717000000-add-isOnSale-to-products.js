import { DataTypes } from 'sequelize';

export async function up(queryInterface) {
  const table = await queryInterface.describeTable('Products');

  if (!table.isOnSale) {
    await queryInterface.addColumn('Products', 'isOnSale', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    });
    console.log('✅ Columna isOnSale agregada a Products');
  } else {
    console.log('ℹ️  Columna isOnSale ya existe en Products');
  }
}

export async function down(queryInterface) {
  const table = await queryInterface.describeTable('Products');
  if (table.isOnSale) {
    await queryInterface.removeColumn('Products', 'isOnSale');
  }
}
