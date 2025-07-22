import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AnalysisService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get('OPENAI_API_KEY'),
    });
  }

  async analyzeDocument(content: string): Promise<{
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
      const prompt = this.buildAnalysisPrompt(content);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a legal document analysis expert. Analyze the provided legal document and provide a comprehensive assessment including:
            1. A concise summary (2-3 sentences)
            2. Risk score (0-100, where 0 is no risk and 100 is extremely high risk)
            3. Key concerns that users should be aware of
            4. Potential legal loopholes or hidden clauses
            5. User obligations and responsibilities
            6. Recommendations for the user
            
            Be thorough but concise. Focus on practical implications for the user.`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const analysis = this.parseAnalysisResponse(response);
      const processingTime = Date.now() - startTime;

      return {
        ...analysis,
        processingTime,
      };
    } catch (error) {
      console.error('Analysis error:', error);
      throw new InternalServerErrorException('Failed to analyze document');
    }
  }

  private buildAnalysisPrompt(content: string): string {
    return `Please analyze the following legal document and provide a structured response in JSON format:

Document Content:
${content.substring(0, 8000)}${content.length > 8000 ? '...' : ''}

Please provide your analysis in the following JSON format:
{
  "summary": "Brief summary of the document",
  "riskScore": 75,
  "keyConcerns": ["Concern 1", "Concern 2", "Concern 3"],
  "loopholes": ["Loophole 1", "Loophole 2"],
  "obligations": ["Obligation 1", "Obligation 2"],
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Focus on identifying:
- Hidden or unclear terms
- Unfair obligations
- Data privacy concerns
- Termination clauses
- Liability limitations
- Dispute resolution terms
- Any clauses that could be problematic for the user`;
  }

  private parseAnalysisResponse(response: string): {
    summary: string;
    riskScore: number;
    keyConcerns: string[];
    loopholes: string[];
    obligations: string[];
    recommendations: string[];
  } {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || 'Analysis completed',
          riskScore: parsed.riskScore || 50,
          keyConcerns: parsed.keyConcerns || [],
          loopholes: parsed.loopholes || [],
          obligations: parsed.obligations || [],
          recommendations: parsed.recommendations || [],
        };
      }

      // Fallback parsing if JSON extraction fails
      return this.fallbackParse(response);
    } catch (error) {
      console.error('Failed to parse analysis response:', error);
      return this.fallbackParse(response);
    }
  }

  private fallbackParse(response: string): {
    summary: string;
    riskScore: number;
    keyConcerns: string[];
    loopholes: string[];
    obligations: string[];
    recommendations: string[];
  } {
    // Simple fallback parsing
    const lines = response.split('\n').filter(line => line.trim());
    
    return {
      summary: lines[0] || 'Document analysis completed',
      riskScore: 50, // Default medium risk
      keyConcerns: lines.filter(line => line.toLowerCase().includes('concern')).slice(0, 5),
      loopholes: lines.filter(line => line.toLowerCase().includes('loophole')).slice(0, 5),
      obligations: lines.filter(line => line.toLowerCase().includes('obligation')).slice(0, 5),
      recommendations: lines.filter(line => line.toLowerCase().includes('recommend')).slice(0, 5),
    };
  }

  async generateSummary(content: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a legal document summarizer. Provide a clear, concise summary of the key points in the document.',
          },
          {
            role: 'user',
            content: `Summarize this legal document in 2-3 sentences:\n\n${content.substring(0, 4000)}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      });

      return completion.choices[0]?.message?.content || 'Summary not available';
    } catch (error) {
      console.error('Summary generation error:', error);
      return 'Summary not available';
    }
  }

  async extractKeyTerms(content: string): Promise<string[]> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Extract key legal terms and clauses from the document.',
          },
          {
            role: 'user',
            content: `Extract the most important legal terms from this document:\n\n${content.substring(0, 4000)}`,
          },
        ],
        temperature: 0.2,
        max_tokens: 300,
      });

      const response = completion.choices[0]?.message?.content || '';
      return response.split('\n').filter(line => line.trim()).slice(0, 10);
    } catch (error) {
      console.error('Key terms extraction error:', error);
      return [];
    }
  }
} 