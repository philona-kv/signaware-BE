import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { User } from '@/modules/users/entities/user.entity';
import { AnalysisService } from './analysis.service';
import {
  AnalyzeTextDto,
  TextAnalysisResponseDto,
  GenerateSummaryDto,
  ExtractKeyTermsDto,
} from './dto/text-analysis.dto';

@ApiTags('Analysis')
@Controller('analysis')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('analyze-text')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Analyze text content',
    description: 'Analyze any text content and get comprehensive insights including risk assessment, key concerns, and recommendations.',
  })
  @ApiResponse({
    status: 200,
    description: 'Text analysis completed successfully',
    type: TextAnalysisResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 500,
    description: 'Analysis service error',
  })
  async analyzeText(
    @Body() analyzeTextDto: AnalyzeTextDto,
    @CurrentUser() user: User,
  ): Promise<any> {
    return this.analysisService.analyzeText(analyzeTextDto.content, user.id);
  }

  @Post('summarize')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate text summary',
    description: 'Generate a concise summary of the provided text content.',
  })
  @ApiResponse({
    status: 200,
    description: 'Summary generated successfully',
    schema: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          example: 'This document outlines the main terms...',
        },
      },
    },
  })
  async generateSummary(
    @Body() generateSummaryDto: GenerateSummaryDto,
  ): Promise<{ summary: string }> {
    const summary = await this.analysisService.generateSummary(
      generateSummaryDto.content,
    );
    return { summary };
  }

  @Post('extract-key-terms')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Extract key terms',
    description: 'Extract important terms and phrases from the provided text.',
  })
  @ApiResponse({
    status: 200,
    description: 'Key terms extracted successfully',
    schema: {
      type: 'object',
      properties: {
        keyTerms: {
          type: 'array',
          items: { type: 'string' },
          example: ['contract', 'liability', 'termination'],
        },
      },
    },
  })
  async extractKeyTerms(
    @Body() extractKeyTermsDto: ExtractKeyTermsDto,
  ): Promise<{ keyTerms: string[] }> {
    const keyTerms = await this.analysisService.extractKeyTerms(
      extractKeyTermsDto.content,
    );
    return { keyTerms };
  }
} 