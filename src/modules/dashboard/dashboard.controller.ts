import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { DashboardService } from './dashboard.service';
import { 
  DashboardResponseDto, 
  MonthlyAnalyticsDto, 
  UserDashboardQueryDto,
  DashboardStatsDto 
} from './dto/dashboard.dto';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get user dashboard data' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard data retrieved successfully', 
    type: DashboardResponseDto 
  })
  async getDashboard(
    @CurrentUser() user: any,
    @Query() query: UserDashboardQueryDto,
  ): Promise<DashboardResponseDto> {
    return this.dashboardService.getDashboardData(user.id, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user dashboard statistics only' })
  @ApiResponse({ 
    status: 200, 
    description: 'Dashboard statistics retrieved successfully', 
    type: DashboardStatsDto 
  })
  async getDashboardStats(
    @CurrentUser() user: any,
  ): Promise<DashboardStatsDto> {
    return this.dashboardService.calculateDashboardStats(user.id);
  }

  @Get('analytics/monthly')
  @ApiOperation({ summary: 'Get monthly analytics for charts' })
  @ApiResponse({ 
    status: 200, 
    description: 'Monthly analytics retrieved successfully', 
    type: [MonthlyAnalyticsDto] 
  })
  async getMonthlyAnalytics(
    @CurrentUser() user: any,
    @Query('monthsBack') monthsBack?: number,
  ): Promise<MonthlyAnalyticsDto[]> {
    return this.dashboardService.getMonthlyAnalytics(user.id, monthsBack);
  }

  @Get('analytics/global')
  @ApiOperation({ summary: 'Get global platform analytics (admin only)' })
  @ApiResponse({ 
    status: 200, 
    description: 'Global analytics retrieved successfully' 
  })
  async getGlobalAnalytics(
    @CurrentUser() user: any,
  ): Promise<{
    totalUsers: number;
    totalDocuments: number;
    avgRiskScore: number;
    documentsThisMonth: number;
  }> {
    // Note: In a real app, you'd check if user is admin here
    return this.dashboardService.getGlobalAnalytics();
  }
} 