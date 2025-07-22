import { IsEnum, IsOptional, IsString, IsEmail, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@/common/enums/user-role.enum';

export class UpdateUserRoleDto {
  @ApiProperty({
    enum: UserRole,
    description: 'The new role to assign to the user',
    example: UserRole.LEGAL_ADVISOR,
  })
  @IsEnum(UserRole)
  role: UserRole;
}

export class UpdateUserProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty({ required: false })
  lastLoginAt?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 