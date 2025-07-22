import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

import { Document, DocumentStatus, DocumentType } from './entities/document.entity';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { PaginationDto, PaginationResponseDto } from '@/common/dto/pagination.dto';
import { AnalysisService } from '@/modules/analysis/analysis.service';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentRepository: Repository<Document>,
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
    private analysisService: AnalysisService,
  ) {}

  async create(createDocumentDto: CreateDocumentDto, userId: string): Promise<Document> {
    const document = this.documentRepository.create({
      ...createDocumentDto,
      userId,
      status: DocumentStatus.PENDING,
    });

    const savedDocument = await this.documentRepository.save(document);

    // Trigger analysis asynchronously
    this.eventEmitter.emit('document.created', { documentId: savedDocument.id });

    return savedDocument;
  }

  async uploadFile(file: Express.Multer.File, userId: string, title?: string): Promise<Document> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedMimeTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.');
    }

    // Validate file size (10MB max)
    const maxSize = this.configService.get('MAX_FILE_SIZE', 10485760);
    if (file.size > maxSize) {
      throw new BadRequestException('File size too large. Maximum size is 10MB.');
    }

    // Save file to disk
    const uploadPath = this.configService.get('UPLOAD_PATH', './uploads');
    const fileName = `${uuidv4()}-${file.originalname}`;
    const filePath = path.join(uploadPath, fileName);

    // Ensure upload directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    fs.writeFileSync(filePath, file.buffer);

    // Extract text content (simplified - in production, use proper text extraction)
    let content = '';
    if (file.mimetype === 'text/plain') {
      content = file.buffer.toString('utf-8');
    } else {
      // For PDF, DOC, DOCX - in production, use libraries like pdf-parse, mammoth, etc.
      content = `[File content extraction not implemented for ${file.mimetype}]`;
    }

    const document = this.documentRepository.create({
      title: title || file.originalname,
      content,
      originalFileName: file.originalname,
      filePath,
      fileSize: file.size,
      mimeType: file.mimetype,
      userId,
      status: DocumentStatus.PENDING,
    });

    const savedDocument = await this.documentRepository.save(document);

    // Trigger analysis asynchronously
    this.eventEmitter.emit('document.created', { documentId: savedDocument.id });

    return savedDocument;
  }

  async findAll(userId: string, paginationDto: PaginationDto): Promise<PaginationResponseDto<Document>> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const [documents, total] = await this.documentRepository.findAndCount({
      where: { userId },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: documents,
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  async findOne(id: string, userId: string): Promise<Document> {
    const document = await this.documentRepository.findOne({
      where: { id, userId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto, userId: string): Promise<Document> {
    const document = await this.findOne(id, userId);
    
    Object.assign(document, updateDocumentDto);
    return this.documentRepository.save(document);
  }

  async remove(id: string, userId: string): Promise<void> {
    const document = await this.findOne(id, userId);
    
    // Delete file if it exists
    if (document.filePath && fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await this.documentRepository.remove(document);
  }

  async analyzeDocument(documentId: string, userId: string): Promise<Document> {
    const document = await this.findOne(documentId, userId);

    if (document.status === DocumentStatus.PROCESSING) {
      throw new BadRequestException('Document is already being processed');
    }

    if (document.status === DocumentStatus.COMPLETED) {
      return document; // Already analyzed
    }

    // Update status to processing
    document.status = DocumentStatus.PROCESSING;
    document.processingStartedAt = new Date();
    await this.documentRepository.save(document);

    try {
      // Perform analysis
      const analysis = await this.analysisService.analyzeDocument(document.content);
      
      // Update document with analysis results
      document.analysis = analysis;
      document.status = DocumentStatus.COMPLETED;
      document.processingCompletedAt = new Date();
      
      return await this.documentRepository.save(document);
    } catch (error) {
      // Update status to failed
      document.status = DocumentStatus.FAILED;
      document.errorMessage = error.message;
      await this.documentRepository.save(document);
      
      throw new InternalServerErrorException('Document analysis failed');
    }
  }

  async getDocumentStatus(documentId: string, userId: string): Promise<{ status: DocumentStatus; analysis?: any }> {
    const document = await this.findOne(documentId, userId);
    
    return {
      status: document.status,
      analysis: document.analysis,
    };
  }

  async maskSensitiveData(content: string): Promise<string> {
    // Simple masking implementation - in production, use more sophisticated NLP
    const patterns = [
      { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL]' },
      { regex: /\b\d{3}-\d{2}-\d{4}\b/g, replacement: '[SSN]' },
      { regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, replacement: '[CREDIT_CARD]' },
      { regex: /\b\d{3}[\s-]?\d{3}[\s-]?\d{4}\b/g, replacement: '[PHONE]' },
    ];

    let maskedContent = content;
    patterns.forEach(({ regex, replacement }) => {
      maskedContent = maskedContent.replace(regex, replacement);
    });

    return maskedContent;
  }
} 