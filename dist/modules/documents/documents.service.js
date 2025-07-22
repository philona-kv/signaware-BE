"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const fs = require("fs");
const path = require("path");
const uuid_1 = require("uuid");
const document_entity_1 = require("./entities/document.entity");
const analysis_service_1 = require("../analysis/analysis.service");
let DocumentsService = class DocumentsService {
    constructor(documentRepository, configService, eventEmitter, analysisService) {
        this.documentRepository = documentRepository;
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.analysisService = analysisService;
    }
    async create(createDocumentDto, userId) {
        const document = this.documentRepository.create({
            ...createDocumentDto,
            userId,
            status: document_entity_1.DocumentStatus.PENDING,
        });
        const savedDocument = await this.documentRepository.save(document);
        this.eventEmitter.emit('document.created', { documentId: savedDocument.id });
        return savedDocument;
    }
    async uploadFile(file, userId, title) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const allowedMimeTypes = [
            'text/plain',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.');
        }
        const maxSize = this.configService.get('MAX_FILE_SIZE', 10485760);
        if (file.size > maxSize) {
            throw new common_1.BadRequestException('File size too large. Maximum size is 10MB.');
        }
        const uploadPath = this.configService.get('UPLOAD_PATH', './uploads');
        const fileName = `${(0, uuid_1.v4)()}-${file.originalname}`;
        const filePath = path.join(uploadPath, fileName);
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        fs.writeFileSync(filePath, file.buffer);
        let content = '';
        if (file.mimetype === 'text/plain') {
            content = file.buffer.toString('utf-8');
        }
        else {
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
            status: document_entity_1.DocumentStatus.PENDING,
        });
        const savedDocument = await this.documentRepository.save(document);
        this.eventEmitter.emit('document.created', { documentId: savedDocument.id });
        return savedDocument;
    }
    async findAll(userId, paginationDto) {
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
    async findOne(id, userId) {
        const document = await this.documentRepository.findOne({
            where: { id, userId },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        return document;
    }
    async update(id, updateDocumentDto, userId) {
        const document = await this.findOne(id, userId);
        Object.assign(document, updateDocumentDto);
        return this.documentRepository.save(document);
    }
    async remove(id, userId) {
        const document = await this.findOne(id, userId);
        if (document.filePath && fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }
        await this.documentRepository.remove(document);
    }
    async analyzeDocument(documentId, userId) {
        const document = await this.findOne(documentId, userId);
        if (document.status === document_entity_1.DocumentStatus.PROCESSING) {
            throw new common_1.BadRequestException('Document is already being processed');
        }
        if (document.status === document_entity_1.DocumentStatus.COMPLETED) {
            return document;
        }
        document.status = document_entity_1.DocumentStatus.PROCESSING;
        document.processingStartedAt = new Date();
        await this.documentRepository.save(document);
        try {
            const analysis = await this.analysisService.analyzeDocument(document.content);
            document.analysis = analysis;
            document.status = document_entity_1.DocumentStatus.COMPLETED;
            document.processingCompletedAt = new Date();
            return await this.documentRepository.save(document);
        }
        catch (error) {
            document.status = document_entity_1.DocumentStatus.FAILED;
            document.errorMessage = error.message;
            await this.documentRepository.save(document);
            throw new common_1.InternalServerErrorException('Document analysis failed');
        }
    }
    async getDocumentStatus(documentId, userId) {
        const document = await this.findOne(documentId, userId);
        return {
            status: document.status,
            analysis: document.analysis,
        };
    }
    async maskSensitiveData(content) {
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
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        config_1.ConfigService,
        event_emitter_1.EventEmitter2,
        analysis_service_1.AnalysisService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map