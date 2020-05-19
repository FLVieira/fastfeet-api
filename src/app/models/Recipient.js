/* eslint-disable no-param-reassign */
import Sequelize, { Model } from 'sequelize';

export default class Recipient extends Model {
  static init(sequelize) {
    super.init(
      {
        receiver_name: Sequelize.STRING,
        receiverName: Sequelize.VIRTUAL,
        street: Sequelize.STRING,
        number: Sequelize.INTEGER,
        adress_complement: Sequelize.STRING,
        adressComplement: Sequelize.VIRTUAL,
        state: Sequelize.STRING,
        city: Sequelize.STRING,
        postal_code: Sequelize.STRING,
        postalCode: Sequelize.VIRTUAL,
      },
      {
        sequelize,
      },
    );
    this.addHook('beforeSave', async (recipient) => {
      recipient.receiver_name = recipient.receiverName;
      recipient.adress_complement = recipient.adressComplement;
      recipient.postal_code = recipient.postalCode;
    });
    return this;
  }
}
