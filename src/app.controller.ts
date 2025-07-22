import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { AuthService } from '@/modules/auth/auth.service';
import { GoogleAuthDto } from '@/modules/auth/dto/auth.dto';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly authService: AuthService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'SignAware Backend',
      version: '1.0.0',
    };
  }

  @Get('firebase-test')
  @ApiOperation({ summary: 'Test Firebase configuration' })
  @ApiResponse({ status: 200, description: 'Firebase is configured correctly' })
  getFirebaseTest() {
    return {
      message: 'Firebase configuration loaded successfully',
      projectId: 'signaware-3ef1b',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('test-firebase-auth')
  @ApiOperation({ summary: 'Test Firebase authentication' })
  @ApiResponse({ status: 200, description: 'Firebase auth test completed' })
  async testFirebaseAuth(@Body() googleAuthDto: GoogleAuthDto) {
    try {
      const result = await this.authService.googleAuth(googleAuthDto);
      return {
        success: true,
        message: 'Firebase authentication working correctly',
        user: result.user,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Firebase authentication failed',
        error: error.message,
      };
    }
  }

  @Get('protected')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Protected endpoint test' })
  @ApiResponse({ status: 200, description: 'Access granted' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProtected() {
    return {
      message: 'You have access to protected resources',
      timestamp: new Date().toISOString(),
    };
  }
} 