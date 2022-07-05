// @flow

import invariant from 'invariant';
import nodemailer from 'nodemailer';

import { importJSON } from '../utils/import-json.js';

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

type PostmarkConfig = {
  +apiToken: string,
};

async function getSendmail(): Promise<Transport> {
  const postmark: ?PostmarkConfig = await importJSON({
    folder: 'facts',
    name: 'postmark',
  });
  invariant(postmark, 'Postmark config missing');
  return nodemailer.createTransport({
    host: 'smtp.postmarkapp.com',
    port: 587,
    secure: false,
    auth: {
      user: postmark.apiToken,
      pass: postmark.apiToken,
    },
    requireTLS: true,
  });
}

export default getSendmail;
