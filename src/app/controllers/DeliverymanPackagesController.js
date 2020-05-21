import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';
import Recipient from '../models/Recipient';

class DeliverymanPackagesController {
  async index(req, res) {
    const { id } = req.params;

    const deliverymanExists = await Deliveryman.findByPk(id);
    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Invalid deliveryman.' });
    }

    const { delivered } = req.query;

    let packages = await Order.findAll({
      where: {
        deliveryman_id: id,
      },
      include: { model: Recipient },
      attributes: ['product', 'canceled_at', 'start_date', 'end_date'],
    });

    if (delivered) {
      // Filtering sended packages
      packages = packages.filter((pack) => {
        if (pack.end_date !== null) {
          return pack;
        }
        return null;
      });
    } else {
      // Filtering unsended and non canceled packages
      packages = packages.filter((pack) => {
        if (pack.end_date === null && pack.canceled_at === null) {
          return pack;
        }
        return null;
      });
    }

    return res.json(packages);
  }

  async update(req, res) {
    // Checking if the order and the deliveryman exists
    const { id, orderId } = req.params;
    const deliverymanExists = await Deliveryman.findByPk(id);
    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Invalid deliveryman.' });
    }
    const orderExists = await Order.findByPk(orderId);
    if (!orderExists) {
      return res.status(400).json({ error: 'Invalid order.' });
    }
    // --
    // Checking if the order is associated to the deliveryman
    const isOrderAssociated = await Order.findOne({
      where: {
        id: orderId,
        deliveryman_id: id,
      },
    });
    if (!isOrderAssociated) {
      return res
        .status(400)
        .json({ error: 'Deliveryman not related to the package.' });
    }
    // --
    // The keys passed below ate boolean
    let { start_date, end_date } = req.body;
    if (start_date) {
      start_date = new Date();
    }
    if (end_date) {
      end_date = new Date();
    }
    // --
    // The deliveryman can only do a withdraw or to finish a delivery
    const { withdraw } = req.query;
    if (withdraw === 'true') {
      try {
        const updatedOrder = await orderExists.update(
          {
            start_date,
          },
          { isWithdraw: true }
        );
        return res.json(updatedOrder);
      } catch (err) {
        return res.status(400).json({ error: err.message });
      }
    }
    if (withdraw === 'false') {
      const updatedOrder = await orderExists.update({
        end_date,
      });
      return res.json(updatedOrder);
    }
    // --
    return res
      .status(400)
      .json({ error: 'You have to specify if it ou its not a withdraw.' });
  }
}

export default new DeliverymanPackagesController();