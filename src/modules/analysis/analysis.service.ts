import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class AnalysisService {
  private readonly apiUrl = 'https://rapid-perfectly-weevil.ngrok-free.app';

  constructor(private configService: ConfigService) {}

  private generateRandomTitle(): string {
    const adjectives = [
      'Important', 'Confidential', 'Legal', 'Business', 'Contract', 'Agreement',
      'Policy', 'Terms', 'Document', 'Analysis', 'Review', 'Draft'
    ];
    
    const nouns = [
      'Document', 'Agreement', 'Contract', 'Policy', 'Terms', 'Analysis',
      'Review', 'Report', 'Summary', 'Text', 'Content', 'File'
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const timestamp = Date.now().toString().slice(-4);
    
    return `${adjective} ${noun} ${timestamp}`;
  }

  private generateRandomFileName(): string {
    const prefixes = [
      'doc', 'text', 'analysis', 'review', 'contract', 'agreement',
      'policy', 'terms', 'legal', 'business'
    ];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.random().toString(36).substring(2, 5);
    
    return `${prefix}_${timestamp}_${randomSuffix}.txt`;
  }

  async analyzeText(content: string, userId: string) {
    const randomTitle = this.generateRandomTitle();
    const randomFileName = this.generateRandomFileName();

    const response: AxiosResponse<any> = await axios.post(`${this.apiUrl}/api/v1/documents`, {
      title: randomTitle,
      content: content,
      type: 'text',
      originalFileName: randomFileName,
      mimeType: 'text/plain',
    }, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });
    const docId = response.data.id;
    return this.analyzeDocument(content, docId, userId);
  }

  async analyzeDocument(content: string, documentId: string, userId: string): Promise<{
    summary: string;
    riskScore: number;
    keyConcerns: string[];
    loopholes: string[];
    obligations: string[];
    recommendations: string[];
    processingTime: number;
  }> {
    const startTime = Date.now();

    try {
      // Call the custom analysis API
      const response: AxiosResponse<any> = await axios.post(`${this.apiUrl}/api/v1/documents/${documentId}/analyze`, {
        user_id: userId,
        // Add any additional parameters your API expects
      }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
        },
      });

      return response.data;
    } catch (error) {
      console.error('Analysis error:', error);
      throw new InternalServerErrorException('Failed to analyze document');
    }
  }

  // Remove OpenAI-specific methods and replace with custom API calls
  async generateSummary(content: string): Promise<string> {
    try {
      const response: AxiosResponse<any> = await axios.post(`${this.apiUrl}/summarize`, {
        content: content.substring(0, 4000),
      }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      return response.data.summary || 'Summary not available';
    } catch (error) {
      console.error('Summary generation error:', error);
      return 'Summary not available';
    }
  }

  async extractKeyTerms(content: string): Promise<string[]> {
    try {
      const response: AxiosResponse<any> = await axios.post(`${this.apiUrl}/extract-terms`, {
        content: content.substring(0, 4000),
      }, {
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
      });

      return response.data.terms || response.data.keyTerms || [];
    } catch (error) {
      console.error('Key terms extraction error:', error);
      return [];
    }
  }
} 