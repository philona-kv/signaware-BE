import {
  Controller,
  Get,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

import { UsersService } from './users.service';
import { UpdateUserRoleDto, UpdateUserProfileDto, UserResponseDto } from './dto/user.dto';
import { PaginationDto, PaginationResponseDto } from '@/common/dto/pagination.dto';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async getAllUsers(
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.usersService.findAll(paginationDto);
  }

  @Get('role/:role')
  @ApiOperation({ summary: 'Get users by role' })
  @ApiParam({ name: 'role', enum: UserRole, description: 'User role to filter by' })
  @ApiResponse({ status: 200, description: 'Users by role retrieved successfully' })
  async getUsersByRole(
    @Param('role') role: UserRole,
    @Query() paginationDto: PaginationDto,
  ): Promise<PaginationResponseDto<UserResponseDto>> {
    return this.usersService.getUsersByRole(role, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findById(id);
  }

  @Patch(':id/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user role' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User role updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 403, description: 'Insufficient permissions' })
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateRole(id, updateUserRoleDto.role);
  }

  @Put(':id/profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully', type: UserResponseDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUserProfile(
    @Param('id') id: string,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateProfile(id, updateUserProfileDto);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deactivated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deactivateUser(@Param('id') id: string): Promise<void> {
    return this.usersService.deactivateUser(id);
  }

  @Patch(':id/activate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Activate user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User activated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async activateUser(@Param('id') id: string): Promise<void> {
    return this.usersService.activateUser(id);
  }
} 