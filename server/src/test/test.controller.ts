import { Controller, Get } from '@nestjs/common';
// import { MailService } from 'src/services/mail.service';

@Controller('test')
export class TestController {
    constructor() {}
    @Get()
    getHello(): string {
        return 'Hello from TestController!';
    }
    @Get('mail')
    async mailTest(){
        // await this.mailService.sendEmail(
        //     'muaazmehmood@gmail.com',
        //     'Subject',
        //     'Text body',
        //     'test'
        //   );
        return "testing mail"
    }
} 