import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
