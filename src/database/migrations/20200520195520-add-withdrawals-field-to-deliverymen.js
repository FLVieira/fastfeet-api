module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('deliverymen', 'withdrawals', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: true,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('deliverymen', 'withdrawals');
  },
};
