module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('deliverymen', 'withdrawals', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('deliverymen', 'withdrawals');
  },
};
