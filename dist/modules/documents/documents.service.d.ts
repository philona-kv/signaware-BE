import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Document, DocumentStatus } from './entities/document.entity';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { PaginationDto, PaginationResponseDto } from '@/common/dto/pagination.dto';
import { AnalysisService } from '@/modules/analysis/analysis.service';
export declare class DocumentsService {
    private documentRepository;
    private configService;
    private eventEmitter;
    private analysisService;
    constructor(documentRepository: Repository<Document>, configService: ConfigService, eventEmitter: EventEmitter2, analysisService: AnalysisService);
    create(createDocumentDto: CreateDocumentDto, userId: string): Promise<Document>;
    uploadFile(file: Express.Multer.File, userId: string, title?: string): Promise<Document>;
    findAll(userId: string, paginationDto: PaginationDto): Promise<PaginationResponseDto<Document>>;
    findOne(id: string, userId: string): Promise<Document>;
    update(id: string, updateDocumentDto: UpdateDocumentDto, userId: string): Promise<Document>;
    remove(id: string, userId: string): Promise<void>;
    analyzeDocument(documentId: string, userId: string): Promise<Document>;
    getDocumentStatus(documentId: string, userId: string): Promise<{
        status: DocumentStatus;
        analysis?: any;
    }>;
    maskSensitiveData(content: string): Promise<string>;
}
