import Sequelize, { Model, Op } from 'sequelize';
import { startOfDay, endOfDay } from 'date-fns';

import Order from './Order';

export default class Deliveryman extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        avatar_id: Sequelize.INTEGER,
        withdrawals: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'deliverymen',
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }
}
