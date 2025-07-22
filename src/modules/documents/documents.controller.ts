import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';

import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto, UpdateDocumentDto, DocumentResponseDto } from './dto/document.dto';
import { PaginationDto } from '@/common/dto/pagination.dto';

@ApiTags('documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new document' })
  @ApiResponse({ status: 201, description: 'Document created successfully', type: DocumentResponseDto })
  async create(
    @Body() createDocumentDto: CreateDocumentDto,
    @CurrentUser('id') userId: string,
  ): Promise<DocumentResponseDto> {
    const document = await this.documentsService.create(createDocumentDto, userId);
    return document;
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload a document file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        title: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully', type: DocumentResponseDto })
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @CurrentUser('id') userId: string,
  ): Promise<DocumentResponseDto> {
    const document = await this.documentsService.uploadFile(file, userId, title);
    return document;
  }

  @Get()
  @ApiOperation({ summary: 'Get all documents for the current user' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully' })
  async findAll(
    @Query() paginationDto: PaginationDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.documentsService.findAll(userId, paginationDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific document' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully', type: DocumentResponseDto })
  @ApiResponse({ status: 404, description: 'Document not found' })
  async findOne(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<DocumentResponseDto> {
    const document = await this.documentsService.findOne(id, userId);
    return document;
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a document' })
  @ApiResponse({ status: 200, description: 'Document updated successfully', type: DocumentResponseDto })
  async update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
    @CurrentUser('id') userId: string,
  ): Promise<DocumentResponseDto> {
    const document = await this.documentsService.update(id, updateDocumentDto, userId);
    return document;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully' })
  async remove(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<void> {
    return this.documentsService.remove(id, userId);
  }

  @Post(':id/analyze')
  @ApiOperation({ summary: 'Analyze a document' })
  @ApiResponse({ status: 200, description: 'Document analysis completed', type: DocumentResponseDto })
  async analyzeDocument(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ): Promise<DocumentResponseDto> {
    const document = await this.documentsService.analyzeDocument(id, userId);
    return document;
  }

  @Get(':id/status')
  @ApiOperation({ summary: 'Get document analysis status' })
  @ApiResponse({ status: 200, description: 'Status retrieved successfully' })
  async getDocumentStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.documentsService.getDocumentStatus(id, userId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download document file' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  async downloadFile(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Res() res: Response,
  ) {
    const document = await this.documentsService.findOne(id, userId);
    
    if (!document.filePath) {
      throw new Error('No file associated with this document');
    }

    res.download(document.filePath, document.originalFileName || 'document');
  }
} 