import { ConfigService } from '@nestjs/config';
export declare class AnalysisService {
    private configService;
    private openai;
    constructor(configService: ConfigService);
    analyzeDocument(content: string): Promise<{
        summary: string;
        riskScore: number;
        keyConcerns: string[];
        loopholes: string[];
        obligations: string[];
        recommendations: string[];
        processingTime: number;
    }>;
    private buildAnalysisPrompt;
    private parseAnalysisResponse;
    private fallbackParse;
    generateSummary(content: string): Promise<string>;
    extractKeyTerms(content: string): Promise<string[]>;
}
