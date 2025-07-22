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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const rxjs_1 = require("rxjs");
const openai_1 = require("openai");
const uuid_1 = require("uuid");
const chat_message_entity_1 = require("./entities/chat-message.entity");
const document_entity_1 = require("../documents/entities/document.entity");
const analysis_service_1 = require("../analysis/analysis.service");
let ChatService = class ChatService {
    constructor(chatMessageRepository, documentRepository, configService, eventEmitter, analysisService) {
        this.chatMessageRepository = chatMessageRepository;
        this.documentRepository = documentRepository;
        this.configService = configService;
        this.eventEmitter = eventEmitter;
        this.analysisService = analysisService;
        this.activeStreams = new Map();
        this.openai = new openai_1.default({
            apiKey: this.configService.get('OPENAI_API_KEY'),
        });
    }
    async sendMessage(sendMessageDto, userId) {
        const { content, documentId, sessionId } = sendMessageDto;
        const document = await this.documentRepository.findOne({
            where: { id: documentId, userId },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        const userMessage = this.chatMessageRepository.create({
            content,
            role: chat_message_entity_1.MessageRole.USER,
            userId,
            documentId,
            sessionId: sessionId || (0, uuid_1.v4)(),
        });
        await this.chatMessageRepository.save(userMessage);
        const aiResponse = await this.generateAIResponse(content, document, sessionId);
        const aiMessage = this.chatMessageRepository.create({
            content: aiResponse.content,
            role: chat_message_entity_1.MessageRole.ASSISTANT,
            userId,
            documentId,
            sessionId: sessionId || userMessage.sessionId,
            metadata: aiResponse.metadata,
        });
        const savedAiMessage = await this.chatMessageRepository.save(aiMessage);
        return {
            id: savedAiMessage.id,
            content: savedAiMessage.content,
            role: savedAiMessage.role,
            createdAt: savedAiMessage.createdAt,
            sessionId: savedAiMessage.sessionId,
            metadata: savedAiMessage.metadata,
        };
    }
    async sendMessageStream(sendMessageDto, userId) {
        const { content, documentId, sessionId } = sendMessageDto;
        const document = await this.documentRepository.findOne({
            where: { id: documentId, userId },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        const userMessage = this.chatMessageRepository.create({
            content,
            role: chat_message_entity_1.MessageRole.USER,
            userId,
            documentId,
            sessionId: sessionId || (0, uuid_1.v4)(),
        });
        await this.chatMessageRepository.save(userMessage);
        const streamId = `${userId}-${documentId}-${Date.now()}`;
        const streamSubject = new rxjs_1.Subject();
        this.activeStreams.set(streamId, streamSubject);
        this.generateStreamingAIResponse(content, document, sessionId || userMessage.sessionId, streamSubject, streamId);
        return streamSubject.asObservable();
    }
    async getChatHistory(documentId, userId, sessionId) {
        const document = await this.documentRepository.findOne({
            where: { id: documentId, userId },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        const whereClause = { documentId, userId };
        if (sessionId) {
            whereClause.sessionId = sessionId;
        }
        const messages = await this.chatMessageRepository.find({
            where: whereClause,
            order: { createdAt: 'ASC' },
        });
        return messages.map(message => ({
            id: message.id,
            content: message.content,
            role: message.role,
            createdAt: message.createdAt,
            sessionId: message.sessionId,
            metadata: message.metadata,
        }));
    }
    async getChatSessions(documentId, userId) {
        const document = await this.documentRepository.findOne({
            where: { id: documentId, userId },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        const sessions = await this.chatMessageRepository
            .createQueryBuilder('message')
            .select('DISTINCT message.sessionId', 'sessionId')
            .where('message.documentId = :documentId', { documentId })
            .andWhere('message.userId = :userId', { userId })
            .getRawMany();
        return sessions.map(session => session.sessionId);
    }
    async generateAIResponse(userMessage, document, sessionId) {
        const startTime = Date.now();
        try {
            const recentMessages = await this.chatMessageRepository.find({
                where: { documentId: document.id, sessionId },
                order: { createdAt: 'DESC' },
                take: 10,
            });
            const conversationHistory = recentMessages
                .reverse()
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n');
            const prompt = this.buildChatPrompt(userMessage, document, conversationHistory);
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are a legal document assistant. You help users understand legal documents by answering their questions about the document content, terms, conditions, and implications. Be helpful, accurate, and provide clear explanations. Always refer to the specific document content when answering questions.`,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 1000,
            });
            const response = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.';
            const processingTime = Date.now() - startTime;
            return {
                content: response,
                metadata: {
                    tokens: completion.usage?.total_tokens,
                    processingTime,
                    model: 'gpt-4',
                    temperature: 0.7,
                },
            };
        }
        catch (error) {
            console.error('AI response generation error:', error);
            return {
                content: 'I apologize, but I encountered an error while processing your request. Please try again.',
                metadata: {
                    processingTime: Date.now() - startTime,
                    error: error.message,
                },
            };
        }
    }
    async generateStreamingAIResponse(userMessage, document, sessionId, streamSubject, streamId) {
        const startTime = Date.now();
        try {
            const recentMessages = await this.chatMessageRepository.find({
                where: { documentId: document.id, sessionId },
                order: { createdAt: 'DESC' },
                take: 10,
            });
            const conversationHistory = recentMessages
                .reverse()
                .map(msg => `${msg.role}: ${msg.content}`)
                .join('\n');
            const prompt = this.buildChatPrompt(userMessage, document, conversationHistory);
            const stream = await this.openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are a legal document assistant. You help users understand legal documents by answering their questions about the document content, terms, conditions, and implications. Be helpful, accurate, and provide clear explanations. Always refer to the specific document content when answering questions.`,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 1000,
                stream: true,
            });
            let fullResponse = '';
            let tokenCount = 0;
            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                if (content) {
                    fullResponse += content;
                    tokenCount++;
                    streamSubject.next(`data: ${JSON.stringify({ content, type: 'chunk' })}\n\n`);
                }
            }
            const aiMessage = this.chatMessageRepository.create({
                content: fullResponse,
                role: chat_message_entity_1.MessageRole.ASSISTANT,
                userId: document.userId,
                documentId: document.id,
                sessionId,
                metadata: {
                    tokens: tokenCount,
                    processingTime: Date.now() - startTime,
                    model: 'gpt-4',
                    temperature: 0.7,
                },
            });
            await this.chatMessageRepository.save(aiMessage);
            streamSubject.next(`data: ${JSON.stringify({ type: 'complete', messageId: aiMessage.id })}\n\n`);
            streamSubject.complete();
        }
        catch (error) {
            console.error('Streaming AI response error:', error);
            streamSubject.next(`data: ${JSON.stringify({
                content: 'I apologize, but I encountered an error while processing your request.',
                type: 'error',
                error: error.message
            })}\n\n`);
            streamSubject.complete();
        }
        finally {
            this.activeStreams.delete(streamId);
        }
    }
    buildChatPrompt(userMessage, document, conversationHistory) {
        return `Document Title: ${document.title}
Document Type: ${document.type}

Document Content:
${document.content.substring(0, 6000)}${document.content.length > 6000 ? '...' : ''}

${conversationHistory ? `Previous Conversation:\n${conversationHistory}\n` : ''}

User Question: ${userMessage}

Please answer the user's question about this legal document. Be specific and reference the document content when possible. If the question is not related to the document, politely redirect the conversation back to the document.`;
    }
    async deleteChatSession(documentId, sessionId, userId) {
        const document = await this.documentRepository.findOne({
            where: { id: documentId, userId },
        });
        if (!document) {
            throw new common_1.NotFoundException('Document not found');
        }
        await this.chatMessageRepository.delete({
            documentId,
            sessionId,
            userId,
        });
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_message_entity_1.ChatMessage)),
    __param(1, (0, typeorm_1.InjectRepository)(document_entity_1.Document)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService,
        event_emitter_1.EventEmitter2,
        analysis_service_1.AnalysisService])
], ChatService);
//# sourceMappingURL=chat.service.js.map