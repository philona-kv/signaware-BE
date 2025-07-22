"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const google_auth_library_1 = require("google-auth-library");
const uuid_1 = require("uuid");
const crypto = require("crypto");
const user_entity_1 = require("../users/entities/user.entity");
const user_role_enum_1 = require("../../common/enums/user-role.enum");
let AuthService = class AuthService {
    constructor(userRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.configService = configService;
        this.googleClient = new google_auth_library_1.OAuth2Client(this.configService.get('GOOGLE_CLIENT_ID'));
    }
    async signUp(signUpDto) {
        const { email, password, firstName, lastName, role } = signUpDto;
        const existingUser = await this.userRepository.findOne({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const user = this.userRepository.create({
            email,
            password,
            firstName,
            lastName,
            role: role || user_role_enum_1.UserRole.CUSTOMER,
            emailVerificationToken: (0, uuid_1.v4)(),
        });
        await this.userRepository.save(user);
        const tokens = await this.generateTokens(user);
        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }
    async signIn(signInDto) {
        const { email, password } = signInDto;
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user || !(await user.validatePassword(password))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Account is deactivated');
        }
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);
        const tokens = await this.generateTokens(user);
        return {
            ...tokens,
            user: this.sanitizeUser(user),
        };
    }
    async googleAuth(googleAuthDto) {
        const { token, role } = googleAuthDto;
        try {
            const ticket = await this.googleClient.verifyIdToken({
                idToken: token,
                audience: this.configService.get('GOOGLE_CLIENT_ID'),
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new common_1.UnauthorizedException('Invalid Google token');
            }
            const { email, given_name, family_name, picture, sub } = payload;
            let user = await this.userRepository.findOne({
                where: { email },
            });
            if (!user) {
                user = this.userRepository.create({
                    email,
                    firstName: given_name,
                    lastName: family_name,
                    avatar: picture,
                    googleId: sub,
                    role: role || user_role_enum_1.UserRole.CUSTOMER,
                    isEmailVerified: true,
                });
                await this.userRepository.save(user);
            }
            else {
                user.googleId = sub;
                user.avatar = picture;
                user.isEmailVerified = true;
                user.lastLoginAt = new Date();
                await this.userRepository.save(user);
            }
            const tokens = await this.generateTokens(user);
            return {
                ...tokens,
                user: this.sanitizeUser(user),
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid Google token');
        }
    }
    async refreshToken(refreshTokenDto) {
        try {
            const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
                secret: this.configService.get('JWT_SECRET'),
            });
            const user = await this.userRepository.findOne({
                where: { id: payload.sub },
            });
            if (!user || !user.isActive) {
                throw new common_1.UnauthorizedException('Invalid refresh token');
            }
            const tokens = await this.generateTokens(user);
            return {
                ...tokens,
                user: this.sanitizeUser(user),
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async forgotPassword(forgotPasswordDto) {
        const { email } = forgotPasswordDto;
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (user) {
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetExpires = new Date(Date.now() + 3600000);
            user.passwordResetToken = resetToken;
            user.passwordResetExpires = resetExpires;
            await this.userRepository.save(user);
            console.log(`Password reset token for ${email}: ${resetToken}`);
        }
    }
    async resetPassword(resetPasswordDto) {
        const { token, newPassword } = resetPasswordDto;
        const user = await this.userRepository.findOne({
            where: { passwordResetToken: token },
        });
        if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
            throw new common_1.BadRequestException('Invalid or expired reset token');
        }
        user.password = newPassword;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;
        await this.userRepository.save(user);
    }
    async verifyEmail(verifyEmailDto) {
        const { token } = verifyEmailDto;
        const user = await this.userRepository.findOne({
            where: { emailVerificationToken: token },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid verification token');
        }
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        await this.userRepository.save(user);
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_EXPIRES_IN', '7d'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: '30d',
            }),
        ]);
        return { accessToken, refreshToken };
    }
    sanitizeUser(user) {
        const { password, emailVerificationToken, passwordResetToken, passwordResetExpires, ...sanitizedUser } = user;
        return sanitizedUser;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map