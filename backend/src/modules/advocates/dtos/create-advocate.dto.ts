/**
 * Create Advocate DTO
 * 
 * @description
 * Data Transfer Object for creating a new advocate.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-25
 *
 */
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateAdvocateDTO {
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsString()
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @IsOptional()
    phone?: string;
}