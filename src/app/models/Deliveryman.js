/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Deliveryman extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        avatar_id: Sequelize.INTEGER,
      },
      {
        sequelize,
        tableName: 'deliverymen',
      }
    );
    return this;
  }
}
