import * as Yup from 'yup';
import { get } from 'lodash';

import Deliveryman from '../models/Deliveryman';

class DeliverymanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required('The name is required.'),
      email: Yup.string().required('The email is required.'),
      avatar_id: Yup.string().required('The avatar_id is required.'),
    });

    try {
      // eslint-disable-next-line no-unused-vars
      const validation = await schema.validate(req.body);
    } catch (err) {
      const errors = get(err, 'message', '');
      return res.status(400).json({ error: errors });
    }

    const { name, email, avatar_id } = req.body;
    const deliveryman = await Deliveryman.create({
      name,
      email,
      avatar_id,
    });
    return res.json(deliveryman);
  }
}

export default new DeliverymanController();
