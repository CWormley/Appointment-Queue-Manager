/**
 * Advocates Controller
 * 
 * @description
 * Handles HTTP requests related to advocates.
 * Provides endpoints for creating, retrieving, updating, and deleting advocates.
 * Utilizes AdvocatesService for business logic.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-25
 *
 */
import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    Query,
} from '@nestjs/common';
import { AdvocatesService } from './advocate.service';
import { CreateAdvocateDTO, UpdateAdvocateDTO } from './dtos';
import { Advocate } from '../../database/entities/advocate.entity';

@Controller('advocates')
export class AdvocatesController {
    constructor(private readonly advocatesService: AdvocatesService) {}

    /**
     * POST /advocates
     * Create a new advocate
     */   
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createAdvocateDTO: CreateAdvocateDTO):Promise<Advocate>{
        return await this.advocatesService.create(createAdvocateDTO);
    }

    /**
     * GET /advocates
     * Get all advocates (with optional pagination)
     */ 
    @Get()
    async findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ): Promise<{
        data: Advocate[],
        total: number,
        page: number,
        limit: number,
        totalPages: number
    }> {
        return await this.advocatesService.findAll(page, limit);
    }

    /**
     * GET /advocates/:id
     * Get advocate by ID
     */
    @Get(':id')
    async findById(@Param('id') id: string):Promise<Advocate>{
        return await this.advocatesService.findById(id);
    }      
    
    @Get('search/:query')
    async searchByString(
        @Param('query') query: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ): Promise<Advocate[]> {
        return await this.advocatesService.searchByString(query, page, limit);
    }

    /**
     * PATCH /advocates/:id
     * Update advocate by ID
     */
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() updateAdvocateDTO: UpdateAdvocateDTO,
    ):Promise<Advocate>{
        return await this.advocatesService.update(id, updateAdvocateDTO);
    }

    /**
     * DELETE /advocates/:id
     * Delete advocate by ID
    */
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async delete(@Param('id') id: string):Promise<void>{
        return await this.advocatesService.delete(id);
    }
}