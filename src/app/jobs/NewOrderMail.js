import Mail from '../../lib/Mail';

class NewOrderMail {
  get key() {
    return 'NewOrderMail';
  }

  async handle({ data }) {
    const { context, deliverymanExists } = data;

    await Mail.sendMail({
      to: `${deliverymanExists.name} <${deliverymanExists.email}>`,
      subject: 'Nova encomenda',
      template: 'newOrder',
      context,
    });
  }
}

export default new NewOrderMail();
