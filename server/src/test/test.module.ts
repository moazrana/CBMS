import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { MailService } from 'src/services/mail.service';

@Module({
  imports: [],
  controllers: [TestController],
  providers: [
    MailService
  ],
  exports: [],
})
export class TestModule {} 