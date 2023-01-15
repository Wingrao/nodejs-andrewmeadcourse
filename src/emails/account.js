const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'andrew@mead.io',
    subject: 'Thanks for Joining!',
    text: `Hi ${name}, welcome to our app`,
  });
};

const sendCancelEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'andrew@mead.io',
    subject: 'Goodbye',
    text: `Hi ${name}, sorry to see you go`,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendCancelEmail,
};
