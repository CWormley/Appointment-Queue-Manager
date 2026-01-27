/**
 * Advocates Service
 * 
 * @description
 * Handles services related to advocates.
 * Provides functions for creating, retrieving, updating, and deleting advocates.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-25
 *
 */
import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advocate } from '../../database/entities/advocate.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { CreateAdvocateDTO, UpdateAdvocateDTO } from './dtos';

@Injectable()
export class AdvocatesService implements OnModuleInit {
    constructor(
        @InjectRepository(Advocate)
        private readonly advocatesRepository: Repository<Advocate>,
        @InjectRepository(Appointment)
        private readonly appointmentsRepository: Repository<Appointment>,
    ) {}

    async onModuleInit() {
        const count = await this.advocatesRepository.count();
        if (count === 0) {
            const examples = Array.from({ length: 10 }).map((_, i) => ({
                name: `Advocate ${i + 1}`,
                email: `advocate${i + 1}@example.com`,
                // add other required fields here
            }));
            await this.advocatesRepository.save(examples);
        }
    }

    /**
     * Create a new advocate
     * @throws ConflictException if advocate with same email already exists
     */
    async create(createAdvocateDTO: CreateAdvocateDTO): Promise<Advocate> {
        const existingAdvocate = await this.advocatesRepository.findOne({
            where: { email: createAdvocateDTO.email }, 
        })
        if (existingAdvocate){
            throw new ConflictException(`Advocate with email ${createAdvocateDTO.email} already exists`);
        }
        const advocate = this.advocatesRepository.create(createAdvocateDTO);
        return await this.advocatesRepository.save(advocate);
    }

    
    /**
     * Get all advocates with pagination info
     */
    async findAll(page?: number, limit?: number): Promise<{
        data: Advocate[],
        total: number,
        page: number,
        limit: number,
        totalPages: number
    }> {
        // Default to page 1 if not provided, and limit to total if not provided
        const safePage = page && page > 0 ? page : 1;
        const [data, total] = await this.advocatesRepository.findAndCount({
            relations: ['appointments'],
            skip: limit ? (safePage - 1) * limit : undefined,
            take: limit || undefined,
        });
        const safeLimit = limit || total || 1;
        const totalPages = limit ? Math.max(1, Math.ceil(total / safeLimit)) : 1;
        return {
            data,
            total,
            page: safePage,
            limit: safeLimit,
            totalPages,
        };
    }   

    /**
     * Get advocate by ID
     * @throws NotFoundException if advocate not found
     */
    async findById(id: string): Promise<Advocate> {
        const advocate = await this.advocatesRepository.findOne({
            where: { id },
            relations: ['appointments'],
        });
        if (!advocate){
            throw new NotFoundException(`Advocate with ID ${id} not found`);
        }
        return advocate;
    }

    async searchByString(query: string, page?: number, limit?: number): Promise<Advocate[]> {
        const skip = page && limit ? (page - 1) * limit : undefined;
        const take = limit || undefined;
        return await this.advocatesRepository
            .createQueryBuilder('advocate')
            .where('advocate.name ILIKE :query OR advocate.email ILIKE :query', { query: `%${query}%` })
            .leftJoinAndSelect('advocate.appointments', 'appointment')
            .skip(skip)
            .take(take)
            .getMany();
    }

    /**
     * Update advocate by ID
     * @throws NotFoundException if advocate not found
     * @throws ConflictException if updating email to one that already exists
     */
    async update(id: string, updateAdvocateDTO: UpdateAdvocateDTO): Promise<Advocate> {
        const advocate = await this.findById(id);
        if (updateAdvocateDTO.email && updateAdvocateDTO.email !== advocate.email) {
            const existingAdvocate = await this.advocatesRepository.findOne({
                where: { email: updateAdvocateDTO.email },
            });
            if (existingAdvocate) {
                throw new ConflictException(`Advocate with email ${updateAdvocateDTO.email} already exists`);
            }
        }
        Object.assign(advocate, updateAdvocateDTO);
        return await this.advocatesRepository.save(advocate);
    }

    /**
     * Delete advocate by ID
     * @throws NotFoundException if advocate not found
     */
    async delete(id: string): Promise<void> {
        const advocate = await this.findById(id);
        await this.advocatesRepository.remove(advocate);
    }   
}