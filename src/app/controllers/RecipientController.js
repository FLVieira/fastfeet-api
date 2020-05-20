/* eslint-disable class-methods-use-this */
import * as Yup from 'yup';
import { get } from 'lodash';

import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    try {
      const recipients = await Recipient.findAll({
        attributes: [
          'id',
          'receiver_name',
          'street',
          'number',
          'adress_complement',
          'state',
          'city',
          'postal_code',
        ],
      });
      return res.json(recipients);
    } catch (err) {
      return res.json({ error: err });
    }
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      receiver_name: Yup.string().required('The Receiver Name is required.'),
      street: Yup.string().required('The street is required.'),
      number: Yup.string().required('The receiver number is required.'),
      adress_complement: Yup.string().required(
        'The adress complement is required.'
      ),
      state: Yup.string().required('The state is required.'),
      city: Yup.string().required('The city is required.'),
      postal_code: Yup.string().required('The postal code is required.'),
    });

    try {
      // eslint-disable-next-line no-unused-vars
      const validation = await schema.validate(req.body);
    } catch (err) {
      const errors = get(err, 'message', '');
      return res.status(400).json({ error: errors });
    }

    try {
      const {
        id,
        receiverName,
        street,
        number,
        adressComplement,
        state,
        city,
        postalCode,
      } = await Recipient.create(req.body);
      return res.json({
        id,
        receiverName,
        street,
        number,
        adressComplement,
        state,
        city,
        postalCode,
      });
    } catch (err) {
      return res.status(400).json({ error: err });
    }
  }
}

export default new RecipientController();
