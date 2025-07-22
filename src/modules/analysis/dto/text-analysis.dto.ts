import { IsString, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeTextDto {
  @ApiProperty({
    description: 'The text content to analyze',
    example: 'This agreement contains several important clauses...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Text must be at least 10 characters long' })
  content: string;

  @ApiProperty({
    description: 'Optional analysis type',
    example: 'legal',
    required: false,
  })
  @IsOptional()
  @IsString()
  analysisType?: string;
}

export class TextAnalysisResponseDto {
  @ApiProperty({
    description: 'Summary of the analyzed text',
    example: 'This document outlines the terms and conditions...',
  })
  summary: string;

  @ApiProperty({
    description: 'Risk score from 0-100',
    example: 75,
  })
  riskScore: number;

  @ApiProperty({
    description: 'Key concerns identified in the text',
    example: ['Data retention clause', 'Termination penalties'],
  })
  keyConcerns: string[];

  @ApiProperty({
    description: 'Potential legal loopholes',
    example: ['Ambiguous liability terms'],
  })
  loopholes: string[];

  @ApiProperty({
    description: 'User obligations and responsibilities',
    example: ['Maintain account security', 'Provide accurate information'],
  })
  obligations: string[];

  @ApiProperty({
    description: 'Recommendations for the user',
    example: ['Review termination clause carefully', 'Consider legal consultation'],
  })
  recommendations: string[];

  @ApiProperty({
    description: 'Processing time in milliseconds',
    example: 1500,
  })
  processingTime: number;
}

export class GenerateSummaryDto {
  @ApiProperty({
    description: 'The text content to summarize',
    example: 'This is a long document that needs to be summarized...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;
}

export class ExtractKeyTermsDto {
  @ApiProperty({
    description: 'The text content to extract key terms from',
    example: 'This legal document contains various terms and conditions...',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  content: string;
} 