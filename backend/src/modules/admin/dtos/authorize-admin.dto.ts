/**
 * Authorize Admin DTO
 * 
 * @description
 * Data Transfer Object for authorizing an admin user.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-02-20
 *
 */
import { IsNotEmpty, IsOctal, IsOptional, IsString } from 'class-validator';

export class AuthorizeAdminDTO {
    @IsString()
    @IsNotEmpty({ message: 'ID is required' })
    id: string;

    @IsString()
    @IsNotEmpty({ message: 'Auth token is required' })
    auth: string;

    @IsString()
    @IsOptional()
    name?: string; // Optional name field for admin user
}