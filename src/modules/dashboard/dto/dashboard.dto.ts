import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total number of document analyses' })
  totalAnalyses: number;

  @ApiProperty({ description: 'Average risk score across all documents', example: 6.2 })
  avgRiskScore: number;

  @ApiProperty({ description: 'Number of documents analyzed this month' })
  thisMonth: number;

  @ApiProperty({ description: 'Estimated time saved in hours', example: 12 })
  timeSaved: number;
}

export class RecentDocumentDto {
  @ApiProperty({ description: 'Document ID' })
  id: string;

  @ApiProperty({ description: 'Document title' })
  title: string;

  @ApiProperty({ description: 'Document type' })
  type: string;

  @ApiProperty({ description: 'Risk score out of 10', example: 7.2 })
  riskScore: number;

  @ApiProperty({ description: 'Processing completion date' })
  completedAt: Date;

  @ApiProperty({ description: 'Document status' })
  status: string;

  @ApiProperty({ description: 'Processing time in seconds' })
  processingTime?: number;
}

export class DashboardResponseDto {
  @ApiProperty({ description: 'Dashboard statistics' })
  stats: DashboardStatsDto;

  @ApiProperty({ description: 'Recent document analyses', type: [RecentDocumentDto] })
  recentDocuments: RecentDocumentDto[];
}

export class MonthlyAnalyticsDto {
  @ApiProperty({ description: 'Month (YYYY-MM format)' })
  month: string;

  @ApiProperty({ description: 'Number of documents analyzed' })
  count: number;

  @ApiProperty({ description: 'Average risk score for the month' })
  avgRiskScore: number;
}

export class UserDashboardQueryDto {
  @ApiProperty({ required: false, description: 'Number of recent documents to fetch', default: 5 })
  limit?: number;

  @ApiProperty({ required: false, description: 'Number of months for trend analysis', default: 6 })
  monthsBack?: number;
} 