import { Injectable } from '@nestjs/common';
import * as mailgun from 'mailgun-js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailService {
  private mg: mailgun.Mailgun;

  constructor() {
    this.mg = mailgun({
      apiKey: process.env.MAILGUN_API_KEY!,
      domain: process.env.MAILGUN_DOMAIN!,
    //   url: 'https://api.eu.mailgun.net',
    });
  }

  async sendEmail(to: string, subject: string, text: string,template:string) {
      const templatePath = path.join(
        process.cwd(),
        'src', 
        'emails', 
        template+'.html'
      );
      const html = fs.readFileSync(templatePath, 'utf8');
    const data = {
      from: `Your App <noreply@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject,
      text,
      html,
    };
    return this.mg.messages().send(data);
  }
}