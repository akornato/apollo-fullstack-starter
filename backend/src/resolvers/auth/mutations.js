const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const randomstring = require('randomstring');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

module.exports = {
  async signup(_, { firstName, lastName, email, password }, ctx, info) {
    if (!validator.isEmail(email)) {
      throw new Error(`Email incorrect`);
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await ctx.db.User.create({ firstName, lastName, email, hash });

    return {
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
    };
  },

  async login(_, { email, password }, ctx, info) {
    const user = await ctx.db.User.findOne({ email }).exec();
    if (!user) {
      throw new Error(`No user found for email: ${email}`);
    }

    const valid = await bcrypt.compare(password, user.hash);
    if (!valid) {
      throw new Error('Invalid password');
    }

    return {
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
    };
  },

  async requestCode(_, { email, from, subject }, ctx, info) {
    const user = await ctx.db.User.findOne({ email }).exec();
    if (!user) {
      throw new Error(`No user found for email: ${email}`);
    }

    const code = randomstring.generate(7);

    sgMail.send({
      to: email,
      from,
      subject,
      text: code,
    });

    user.code = code;
    await user.save();

    return {
      email,
    };
  },

  async setPassword(_, { email, code, password }, ctx, info) {
    const user = await ctx.db.User.findOne({ email }).exec();
    if (!user) {
      throw new Error(`No user found for email: ${email}`);
    }

    if (!user.code) {
      throw new Error(`Verification code not requested`);
    }

    if (user.code !== code) {
      throw new Error(`Verification code incorrect`);
    }

    user.code = null;
    user.hash = await bcrypt.hash(password, 10);
    await user.save();

    return {
      token: jwt.sign({ userId: user.id }, process.env.APP_SECRET),
    };
  },
};
