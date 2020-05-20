import * as Yup from 'yup';
import { get } from 'lodash';

import Order from '../models/Order';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';

import NewOrderMail from '../jobs/NewOrderMail';
import Queue from '../../lib/Queue';

class OrderController {
  async index(req, res) {
    const orders = await Order.findAll();
    res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().required('The recipient_id is required.'),
      deliveryman_id: Yup.number().required('The deliveryman_id is required.'),
      product: Yup.string().required('The product is required.'),
    });

    try {
      // eslint-disable-next-line no-unused-vars
      const validation = await schema.validate(req.body);
    } catch (err) {
      const errors = get(err, 'message', '');
      return res.status(400).json({ error: errors });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const deliverymanExists = await Deliveryman.findByPk(deliveryman_id);
    if (!deliverymanExists) {
      return res.status(400).json({ error: 'Invalid deliveryman.' });
    }
    const recipientExists = await Recipient.findByPk(recipient_id);
    if (!recipientExists) {
      return res.status(400).json({ error: 'Invalid recipient.' });
    }

    // Sending an email to the related Deliveryman
    const context = {
      deliverymanName: deliverymanExists.name,
      product,
      receiver_name: recipientExists.receiver_name,
      street: recipientExists.street,
      number: recipientExists.number,
      adress_complement: recipientExists.adress_complement,
      state: recipientExists.state,
      city: recipientExists.city,
      postal_code: recipientExists.postal_code,
    };

    await Queue.add(NewOrderMail.key, {
      context,
      deliverymanExists,
    });

    const order = await Order.create(req.body);
    return res.json(order);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      signature_id: Yup.number(),
      canceled_at: Yup.date(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    try {
      // eslint-disable-next-line no-unused-vars
      const validation = await schema.validate(req.body);
    } catch (err) {
      const errors = get(err, 'message', '');
      return res.status(400).json({ error: errors });
    }

    const { id } = req.params;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(400).json({ error: 'Invalid order.' });
    }

    const { signature_id } = req.body;
    const signatureExists = await File.findByPk(signature_id);
    if (!signatureExists) {
      return res.status(400).json({ error: 'Invalid signature.' });
    }

    const updatedOrder = await order.update(req.body);
    return res.json(updatedOrder);
  }

  async delete(req, res) {
    const { id } = req.params;

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(400).json({ error: 'Invalid order.' });
    }

    await order.destroy();

    return res.send();
  }
}

export default new OrderController();
