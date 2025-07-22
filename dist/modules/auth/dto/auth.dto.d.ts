import { UserRole } from '@/common/enums/user-role.enum';
export declare class SignUpDto {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: UserRole;
}
export declare class SignInDto {
    email: string;
    password: string;
}
export declare class GoogleAuthDto {
    token: string;
    role?: UserRole;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        role: UserRole;
        avatar?: string;
        isEmailVerified: boolean;
    };
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class VerifyEmailDto {
    token: string;
}
