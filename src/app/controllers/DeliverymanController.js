import { Op } from 'sequelize';
import * as Yup from 'yup';
import { get } from 'lodash';

import Deliveryman from '../models/Deliveryman';
import File from '../models/File';

class DeliverymanController {
  async index(req, res) {
    const deliverymanName = req.query.name;
    const deliverymen = await Deliveryman.findAll({
      where: { name: { [Op.like]: `%${deliverymanName}%` } },
      attributes: ['id', 'name', 'email'],
      include: [
        { model: File, as: 'avatar', attributes: ['name', 'path', 'url'] },
      ],
    });
    res.json(deliverymen);
  }

  async show(req, res) {
    const { id } = req.params;
    const deliveryman = await Deliveryman.findByPk(id, {
      attributes: ['id', 'name', 'email', 'created_at'],
      include: [
        { model: File, as: 'avatar', attributes: ['name', 'path', 'url'] },
      ],
    });
    if (!deliveryman) {
      return res.status(400).json({ error: 'Invalid deliveryman.' });
    }
    return res.json(deliveryman);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required('The name is required.'),
      email: Yup.string().required('The email is required.'),
      avatar_id: Yup.number(),
    });
    try {
      // eslint-disable-next-line no-unused-vars
      const validation = await schema.validate(req.body);
    } catch (err) {
      const errors = get(err, 'message', '');
      return res.status(400).json({ error: errors });
    }

    const { name, email, avatar_id } = req.body;

    if (avatar_id) {
      const avatarExists = await File.findByPk(avatar_id);
      if (!avatarExists) {
        return res.status(400).json({ error: 'Invalid avatar.' });
      }
    }

    const deliverymanExists = await Deliveryman.findOne({
      where: {
        email,
      },
    });
    if (deliverymanExists) {
      return res
        .status(400)
        .json({ error: 'A deliveryman with this email already exists.' });
    }

    const deliveryman = await Deliveryman.create({
      name,
      email,
      avatar_id,
    });
    return res.json(deliveryman);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string(),
      avatar_id: Yup.number(),
    });

    try {
      // eslint-disable-next-line no-unused-vars
      const validation = await schema.validate(req.body);
    } catch (err) {
      const errors = get(err, 'message', '');
      return res.status(400).json({ error: errors });
    }

    const { id } = req.params;
    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Invalid deliveryman.' });
    }

    const { email, avatar_id } = req.body;

    if (email) {
      const deliverymanExists = await Deliveryman.findOne({
        where: {
          email,
        },
      });
      if (
        deliverymanExists &&
        deliverymanExists.dataValues.email !== deliveryman.dataValues.email
      ) {
        return res
          .status(400)
          .json({ error: 'A deliveryman with this email already exists.' });
      }
    }

    if (avatar_id) {
      const avatarExists = await File.findByPk(avatar_id);
      if (!avatarExists) {
        return res.status(400).json({ error: 'Invalid avatar.' });
      }
    }

    const updatedDeliveryman = await deliveryman.update(req.body);
    return res.json(updatedDeliveryman);
  }

  async delete(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Invalid deliveryman.' });
    }

    await deliveryman.destroy();

    return res.send();
  }
}

export default new DeliverymanController();
