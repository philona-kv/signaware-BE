import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from '@/common/enums/user-role.enum';
import { PaginationDto, PaginationResponseDto } from '@/common/dto/pagination.dto';
export declare class UsersService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    updateProfile(id: string, updateData: Partial<User>): Promise<User>;
    updateRole(id: string, role: UserRole): Promise<User>;
    deactivateUser(id: string): Promise<void>;
    activateUser(id: string): Promise<void>;
    findAll(paginationDto: PaginationDto): Promise<PaginationResponseDto<User>>;
    getUsersByRole(role: UserRole, paginationDto: PaginationDto): Promise<PaginationResponseDto<User>>;
}
