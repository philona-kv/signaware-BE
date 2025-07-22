import { DocumentType } from '../entities/document.entity';
export declare class CreateDocumentDto {
    title: string;
    content: string;
    type?: DocumentType;
}
export declare class UpdateDocumentDto {
    title?: string;
    type?: DocumentType;
}
export declare class DocumentResponseDto {
    id: string;
    title: string;
    content: string;
    type: DocumentType;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    analysis?: {
        summary: string;
        riskScore: number;
        keyConcerns: string[];
        loopholes: string[];
        obligations: string[];
        recommendations: string[];
        processingTime: number;
    };
}
