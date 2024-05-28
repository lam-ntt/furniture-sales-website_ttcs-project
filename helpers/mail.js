const nodemailer = require('nodemailer')

const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NAME,
    pass: process.env.PASS
  }
})

module.exports = mailTransport

