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
import { Injectable, NotFoundException, ConflictException, OnModuleInit, Redirect } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advocate } from '../../database/entities/advocate.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { CreateAdvocateDTO, UpdateAdvocateDTO } from './dtos';
import { redis } from 'src/redis';  
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
        await redis.del("advocates:count:all");
        return await this.advocatesRepository.save(advocate);
    }

    /**
     * Get all advocates with pagination info
     * pagination with cursor
     * NOTE: I've decided to use cursor instead of offest for improved scalability
     */
    async findAll(cursor?: string, pageSize?: string, search?: string,): Promise<{
        data: Advocate[],
        pageSize: number,
        next_cursor?: string
    }> {
        // Default to page 1 if not provided, and limit to total if not provided
        const safePageSize = Number(pageSize) || 10;
        const qb = this.advocatesRepository.createQueryBuilder('advocate')
                    .leftJoinAndSelect('advocate.appointments', 'appointment')
                    .orderBy('advocate.id', 'ASC')
                    .take(safePageSize + 1)
        if(cursor){
            const cursorAdvocate = await this.advocatesRepository.findOne({
                where: { id: cursor },
            });
            if(!cursorAdvocate){
                throw new NotFoundException(`Advocate with ID ${cursor} not found`);
            }   
            qb.where('advocate.id >= :cursorId', { cursorId: cursorAdvocate.id })
        }
        if(search){
            qb.andWhere('(advocate.name ILIKE :search OR advocate.email ILIKE :search)', {search: `%${search}%`}) 
            const [data] = await qb.getManyAndCount();
            return{
                    data: data.slice(0, safePageSize),
                    pageSize : safePageSize,
                    next_cursor: data.length > safePageSize ? data[data.length -1].id : undefined
                }
        }
        const data = await qb.getMany();
        return{
            data: data.slice(0, safePageSize),
            pageSize : safePageSize,
            next_cursor: data.length > safePageSize ? data[data.length -1].id : undefined
        }
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
        await redis.del("advocates:count:all");
        return await this.advocatesRepository.save(advocate);
    }

    /**
     * Delete advocate by ID
     * @throws NotFoundException if advocate not found
     */
    async delete(id: string): Promise<void> {
        const advocate = await this.findById(id);
        await redis.del("advocates:count:all");
        await this.advocatesRepository.remove(advocate);
    }   
}