const nodemailer = require("nodemailer");
const htmlToText = require("html-to-text");
const pug = require("pug");

//new Email(user, url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.firstname;
    this.url = url;
    this.from =
      process.env.NODE_ENV === "production"
        ? `Zaid Abachi<${process.env.SENDGRID_EMAIL_FROM}>`
        : `Zaid Abachi <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Sendgrid
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMIAL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML
    const html = pug.renderFile(
      `${__dirname}/../utilities/email/${template}.pug`,
      {
        firstname: this.firstname,
        url: this.url,
        subject,
      }
    );

    // 2) Define Email Options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    // 3) new a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "welcome to the HANFs Family!");
  }

  async sendPasswordReset() {
    await this.send(
      "passwordReset",
      "Your password reset token (Valid for only 10 minutes)"
    );
  }
};
