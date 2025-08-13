import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: any;
            name: string;
            email: string;
            role: string;
            permissions: import("../users/schemas/permission.schema").Permission[];
        };
    }>;
}
