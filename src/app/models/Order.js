import Sequelize, { Op, Model } from 'sequelize';
import { startOfDay, endOfDay } from 'date-fns';
import Deliveryman from './Deliveryman';

export default class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        recipient_id: Sequelize.INTEGER,
        deliveryman_id: Sequelize.INTEGER,
        signature_id: Sequelize.INTEGER,
        product: Sequelize.STRING,
        canceled_at: Sequelize.DATE,
        start_date: Sequelize.DATE,
        end_date: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );

    // Hook responsible for the withdrawalsCount for the deliveryman
    this.addHook('beforeUpdate', async (order, options) => {
      if (options.isWithdraw === true) {
        const withdrawalsOnDay = await Order.findAll({
          where: {
            start_date: {
              [Op.between]: [startOfDay(new Date()), endOfDay(new Date())],
            },
            deliveryman_id: order.deliveryman_id,
          },
        });
        const withdrawalsCount = Object.keys(withdrawalsOnDay).length + 1;

        if (withdrawalsCount > 5) {
          throw new Error(
            'You have achieved the maximum number of withdrawals.'
          );
        }
        const deliveryman = await Deliveryman.findByPk(order.deliveryman_id);
        await deliveryman.update({
          withdrawals: withdrawalsCount,
        });
      }
    });

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Deliveryman, { foreignKey: 'deliveryman_id' });
    this.belongsTo(models.Recipient, { foreignKey: 'recipient_id' });
    this.belongsTo(models.File, {
      foreignKey: 'signature_id',
      as: 'signature_picture',
    });
  }
}
