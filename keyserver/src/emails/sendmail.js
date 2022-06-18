// @flow

import nodemailer from 'nodemailer';

import postmark from '../../facts/postmark.json';

type MailInfo = {
  +from: string,
  +to: string,
  +subject: string,
  +html: string,
  ...
};
type Transport = {
  +sendMail: (info: MailInfo) => Promise<mixed>,
  ...
};

const sendmail: Transport = nodemailer.createTransport({
  host: 'smtp.postmarkapp.com',
  port: 587,
  secure: false,
  auth: {
    user: postmark.apiToken,
    pass: postmark.apiToken,
  },
});

export default sendmail;
