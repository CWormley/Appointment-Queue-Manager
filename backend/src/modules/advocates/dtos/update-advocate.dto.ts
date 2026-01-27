/**
 * Update Advocate DTO
 * 
 * @description
 * Data Transfer Object for updating an existing advocate.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-25
 *
 */
import { IsString, IsOptional } from 'class-validator';

export class UpdateAdvocateDTO {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;
}