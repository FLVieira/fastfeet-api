import * as Yup from 'yup';
import { get } from 'lodash';

import DeliveryProblem from '../models/DeliveryProblem';
import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';

import CancellationMail from '../jobs/CancellationMail';
import Queue from '../../lib/Queue';

class DeliveryProblemController {
  async index(req, res) {
    const deliveryProblems = await DeliveryProblem.findAll({
      include: [{ model: Order, where: { canceled_at: null } }],
      attributes: ['description', 'created_at', 'id'],
    });
    return res.json(deliveryProblems);
  }

  async show(req, res) {
    const { id } = req.params;

    const orderExists = await Order.findByPk(id);
    if (!orderExists) {
      return res.status(400).json({ error: 'Invalid order.' });
    }

    const deliveryProblems = await DeliveryProblem.findAll({
      where: {
        delivery_id: id,
      },
      include: [{ model: Order }],
      attributes: ['description', 'created_at', 'id'],
    });
    return res.json(deliveryProblems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required('The description is required.'),
    });

    try {
      // eslint-disable-next-line no-unused-vars
      const validation = await schema.validate(req.body);
    } catch (err) {
      const errors = get(err, 'message', '');
      return res.status(400).json({ error: errors });
    }

    const { id, orderId } = req.params;

    const deliverymanExists = await Deliveryman.findByPk(id);
    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Invalid deliveryman.' });
    }
    const orderExists = await Order.findByPk(orderId);
    if (!orderExists) {
      return res.status(400).json({ error: 'Invalid order.' });
    }
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

    const { description } = req.body;
    const deliveryProblem = await DeliveryProblem.create({
      delivery_id: orderId,
      description,
    });
    return res.json(deliveryProblem);
  }

  async delete(req, res) {
    const { id } = req.params;

    const problemExists = await DeliveryProblem.findByPk(id);
    if (!problemExists) {
      return res
        .status(400)
        .json({ error: 'The delivery problem is invalid.' });
    }

    const orderId = problemExists.delivery_id;

    const order = await Order.findByPk(orderId, {
      include: [{ model: Deliveryman }, { model: Recipient }],
    });

    const updatedOrder = await order.update({
      canceled_at: new Date(),
    });

    // Sending a cancellation mail to the deliveryman

    const context = {
      deliverymanName: order.Deliveryman.name,
      deliverymanEmail: order.Deliveryman.email,
      id: order.id,
      name: order.Recipient.receiver_name,
      street: order.Recipient.street,
      number: order.Recipient.number,
      adress_complement: order.Recipient.adress_complement,
      state: order.Recipient.state,
      city: order.Recipient.city,
      postal_code: order.Recipient.postal_code,
    };

    await Queue.add(CancellationMail.key, {
      context,
    });

    return res.json(updatedOrder);
  }
}

export default new DeliveryProblemController();
