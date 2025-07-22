import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto, DocumentResponseDto } from './dto/document.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    create(createDocumentDto: CreateDocumentDto, userId: string): Promise<DocumentResponseDto>;
    uploadFile(file: Express.Multer.File, title: string, userId: string): Promise<DocumentResponseDto>;
    findAll(paginationDto: PaginationDto, userId: string): Promise<import("@/common/dto/pagination.dto").PaginationResponseDto<import("./entities/document.entity").Document>>;
    findOne(id: string, userId: string): Promise<DocumentResponseDto>;
    update(id: string, updateDocumentDto: UpdateDocumentDto, userId: string): Promise<DocumentResponseDto>;
    remove(id: string, userId: string): Promise<void>;
    analyzeDocument(id: string, userId: string): Promise<DocumentResponseDto>;
    getDocumentStatus(id: string, userId: string): Promise<{
        status: import("./entities/document.entity").DocumentStatus;
        analysis?: any;
    }>;
    downloadFile(id: string, userId: string, res: Response): Promise<void>;
}
