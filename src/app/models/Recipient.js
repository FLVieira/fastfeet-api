import Sequelize, { Model } from 'sequelize';

export default class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        receiver_name: Sequelize.STRING,
        street: Sequelize.STRING,
        number: Sequelize.INTEGER,
        adress_complement: Sequelize.STRING,
        state: Sequelize.STRING,
        city: Sequelize.STRING,
        postal_code: Sequelize.STRING,
      },
      {
        sequelize,
      }
    );
    return this;
  }
}
