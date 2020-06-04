import { isAfter, isBefore, setSeconds, setMinutes, setHours } from 'date-fns';

import Deliveryman from '../models/Deliveryman';
import Order from '../models/Order';
import Recipient from '../models/Recipient';
import File from '../models/File';

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
      attributes: [
        'id',
        'product',
        'created_at',
        'canceled_at',
        'start_date',
        'end_date',
      ],
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
    // The deliveryman can only do a withdraw or to finish a delivery
    const { withdraw, delivery } = req.query;
    const start_date = new Date();
    const end_date = new Date();

    if (withdraw === 'true') {
      // Checking if the start_date is after 08:00 and before 18:00
      const startInterval = setSeconds(
        setMinutes(setHours(start_date, 8), 0),
        0
      );
      const endInterval = setSeconds(
        setMinutes(setHours(start_date, 18), 0),
        0
      );

      if (
        isAfter(start_date, endInterval) ||
        isBefore(start_date, startInterval)
      ) {
        return res.status(400).json({
          error: 'Pedidos devem ser retirados entre 08:00h e 18:00h.',
        });
      }
      // --
      try {
        // I created a hook inside the Order model that checks if the number of withdrawals is === 5
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
    if (delivery === 'true') {
      const { signature_picture } = req.body;
      if (!signature_picture) {
        return res.status(400).json({
          error: 'The signature picture is required to finish the delivery.',
        });
      }
      await orderExists.update({
        end_date,
        signature_id: signature_picture,
      });
      const orderWithFile = await Order.findByPk(orderExists.id, {
        include: [
          {
            model: File,
            as: 'signature_picture',
            attributes: ['url', 'id', 'path'],
          },
        ],
      });
      return res.json({ orderWithFile });
    }
    // --
    return res
      .status(400)
      .json({ error: "You have to specify if it's or isn't a withdraw." });
  }
}

export default new DeliverymanPackagesController();
