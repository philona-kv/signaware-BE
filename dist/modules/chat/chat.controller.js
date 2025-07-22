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
exports.ChatController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const rxjs_1 = require("rxjs");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
const chat_service_1 = require("./chat.service");
const chat_dto_1 = require("./dto/chat.dto");
let ChatController = class ChatController {
    constructor(chatService) {
        this.chatService = chatService;
    }
    async sendMessage(sendMessageDto, userId) {
        return this.chatService.sendMessage(sendMessageDto, userId);
    }
    async sendMessageStream(sendMessageDto, userId, res) {
        const stream = await this.chatService.sendMessageStream(sendMessageDto, userId);
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');
        stream.subscribe({
            next: (data) => {
                res.write(data);
            },
            error: (error) => {
                console.error('Stream error:', error);
                res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
                res.end();
            },
            complete: () => {
                res.end();
            },
        });
    }
    streamChat(documentId, userId, sessionId) {
        return new rxjs_1.Observable(subscriber => {
            const interval = setInterval(() => {
                subscriber.next({
                    data: { type: 'heartbeat', timestamp: new Date().toISOString() },
                });
            }, 30000);
            return () => clearInterval(interval);
        });
    }
    async getChatHistory(documentId, userId, sessionId) {
        return this.chatService.getChatHistory(documentId, userId, sessionId);
    }
    async getChatSessions(documentId, userId) {
        return this.chatService.getChatSessions(documentId, userId);
    }
    async deleteChatSession(documentId, sessionId, userId) {
        return this.chatService.deleteChatSession(documentId, sessionId, userId);
    }
};
exports.ChatController = ChatController;
__decorate([
    (0, common_1.Post)('send'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message to chat with document' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Message sent successfully', type: chat_dto_1.ChatMessageResponseDto }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.SendMessageDto, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessage", null);
__decorate([
    (0, common_1.Post)('send/stream'),
    (0, swagger_1.ApiOperation)({ summary: 'Send a message and get streaming response' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Streaming response initiated' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [chat_dto_1.SendMessageDto, String, Object]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "sendMessageStream", null);
__decorate([
    (0, common_1.Sse)('stream/:documentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Server-Sent Events stream for real-time chat' }),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", rxjs_1.Observable)
], ChatController.prototype, "streamChat", null);
__decorate([
    (0, common_1.Get)('history/:documentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get chat history for a document' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chat history retrieved successfully', type: [chat_dto_1.ChatMessageResponseDto] }),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(2, (0, common_1.Query)('sessionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChatHistory", null);
__decorate([
    (0, common_1.Get)('sessions/:documentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all chat sessions for a document' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chat sessions retrieved successfully' }),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "getChatSessions", null);
__decorate([
    (0, common_1.Post)('sessions/:documentId/:sessionId/delete'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a chat session' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Chat session deleted successfully' }),
    __param(0, (0, common_1.Param)('documentId')),
    __param(1, (0, common_1.Param)('sessionId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ChatController.prototype, "deleteChatSession", null);
exports.ChatController = ChatController = __decorate([
    (0, swagger_1.ApiTags)('chat'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('chat'),
    __metadata("design:paramtypes", [chat_service_1.ChatService])
], ChatController);
//# sourceMappingURL=chat.controller.js.map