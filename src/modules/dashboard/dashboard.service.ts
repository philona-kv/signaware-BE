import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Not, Repository } from "typeorm";

import {
  Document,
  DocumentStatus,
} from "@/modules/documents/entities/document.entity";
import { User } from "@/modules/users/entities/user.entity";
import {
  DashboardResponseDto,
  DashboardStatsDto,
  MonthlyAnalyticsDto,
  RecentDocumentDto,
  UserDashboardQueryDto,
} from "./dto/dashboard.dto";

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    @InjectRepository(User)
    private userRepository: Repository<User>
  ) {}

  async getDashboardData(
    userId: string,
    query: UserDashboardQueryDto
  ): Promise<DashboardResponseDto> {
    const { limit = 5, monthsBack = 6 } = query;

    const [stats, recentDocuments] = await Promise.all([
      this.calculateDashboardStats(userId),
      this.getRecentDocuments(userId, limit),
    ]);

    return {
      stats,
      recentDocuments,
    };
  }

  async calculateDashboardStats(userId: string): Promise<DashboardStatsDto> {
    // Get all completed documents for the user
    const completedDocuments = await this.documentRepository.find({
      where: {
        userId,
        status: DocumentStatus.COMPLETED,
        analysis: Not(IsNull()),
      },
    });

    // Calculate total analyses
    const totalAnalyses = completedDocuments.length;

    // Calculate average risk score
    const totalRiskScore = completedDocuments.reduce((sum, doc) => {
      return sum + (doc.analysis?.analysis?.risk_score || 0);
    }, 0);
    const avgRiskScore =
      totalAnalyses > 0
        ? Math.round((totalRiskScore / totalAnalyses) * 10) / 10
        : 0;

    // Calculate documents this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthDocuments = completedDocuments.filter(
      (doc) =>
        doc.processingCompletedAt && doc.processingCompletedAt >= startOfMonth
    );
    const thisMonth = thisMonthDocuments.length;

    // Calculate estimated time saved (assuming 2-4 hours per document analysis)
    const avgTimeSavedPerDocument = 3; // hours
    const timeSaved = totalAnalyses * avgTimeSavedPerDocument;

    return {
      totalAnalyses,
      avgRiskScore,
      thisMonth,
      timeSaved,
    };
  }

  async getRecentDocuments(
    userId: string,
    limit: number
  ): Promise<RecentDocumentDto[]> {
    const documents = await this.documentRepository.find({
      where: {
        userId,
        status: DocumentStatus.COMPLETED,
        analysis: Not(IsNull()),
      },
      order: { processingCompletedAt: "DESC" },
      take: limit,
    });

    return documents.map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: doc.type,
      riskScore:
        Math.round((doc.analysis?.analysis?.risk_score || 0) * 10) / 10,
      completedAt: doc.processingCompletedAt || doc.updatedAt,
      status: doc.status,
      processingTime: doc.analysis?.processingTime,
    }));
  }

  async getMonthlyAnalytics(
    userId: string,
    monthsBack = 6
  ): Promise<MonthlyAnalyticsDto[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    const documents = await this.documentRepository
      .createQueryBuilder("document")
      .where("document.userId = :userId", { userId })
      .andWhere("document.status = :status", {
        status: DocumentStatus.COMPLETED,
      })
      .andWhere("document.processingCompletedAt >= :startDate", { startDate })
      .andWhere("document.processingCompletedAt <= :endDate", { endDate })
      .andWhere("document.analysis IS NOT NULL")
      .getMany();

    // Group by month
    const monthlyData = new Map<string, { count: number; totalRisk: number }>();

    documents.forEach((doc) => {
      if (doc.processingCompletedAt) {
        const monthKey = `${doc.processingCompletedAt.getFullYear()}-${String(doc.processingCompletedAt.getMonth() + 1).padStart(2, "0")}`;
        const existing = monthlyData.get(monthKey) || {
          count: 0,
          totalRisk: 0,
        };
        existing.count++;
        existing.totalRisk += doc.analysis?.risk_score || 0;
        monthlyData.set(monthKey, existing);
      }
    });

    // Convert to array and calculate averages
    const analytics: MonthlyAnalyticsDto[] = [];
    for (const [month, data] of monthlyData.entries()) {
      analytics.push({
        month,
        count: data.count,
        avgRiskScore:
          data.count > 0
            ? Math.round((data.totalRisk / data.count) * 10) / 10
            : 0,
      });
    }

    return analytics.sort((a, b) => a.month.localeCompare(b.month));
  }

  async getGlobalAnalytics(): Promise<{
    totalUsers: number;
    totalDocuments: number;
    avgRiskScore: number;
    documentsThisMonth: number;
  }> {
    const [totalUsers, allDocuments] = await Promise.all([
      this.userRepository.count({ where: { isActive: true } }),
      this.documentRepository.find({
        where: {
          status: DocumentStatus.COMPLETED,
          analysis: Not(IsNull()),
        },
      }),
    ]);

    const totalDocuments = allDocuments.length;

    const totalRiskScore = allDocuments.reduce((sum, doc) => {
      return sum + (doc.analysis?.risk_score || 0);
    }, 0);
    const avgRiskScore =
      totalDocuments > 0
        ? Math.round((totalRiskScore / totalDocuments) * 10) / 10
        : 0;

    // Calculate documents this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const documentsThisMonth = allDocuments.filter(
      (doc) =>
        doc.processingCompletedAt && doc.processingCompletedAt >= startOfMonth
    ).length;

    return {
      totalUsers,
      totalDocuments,
      avgRiskScore,
      documentsThisMonth,
    };
  }
}
