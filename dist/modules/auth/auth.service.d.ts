import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { SignUpDto, SignInDto, GoogleAuthDto, AuthResponseDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private configService;
    private googleClient;
    constructor(userRepository: Repository<User>, jwtService: JwtService, configService: ConfigService);
    signUp(signUpDto: SignUpDto): Promise<AuthResponseDto>;
    signIn(signInDto: SignInDto): Promise<AuthResponseDto>;
    googleAuth(googleAuthDto: GoogleAuthDto): Promise<AuthResponseDto>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void>;
    private generateTokens;
    private sanitizeUser;
}
