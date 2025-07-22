import { Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto, GoogleAuthDto, AuthResponseDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signUp(signUpDto: SignUpDto): Promise<AuthResponseDto>;
    signIn(signInDto: SignInDto): Promise<AuthResponseDto>;
    googleAuth(googleAuthDto: GoogleAuthDto): Promise<AuthResponseDto>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponseDto>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void>;
    verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<void>;
    googleAuthCallback(req: any, res: Response): Promise<void>;
}
