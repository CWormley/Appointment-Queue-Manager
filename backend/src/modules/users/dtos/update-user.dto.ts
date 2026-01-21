/**
 * Update User DTO
 * 
 * @description
 * Data Transfer Object for updating an existing user.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
import { IsEmail, IsString, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../../database/entities/user.entity';

export class UpdateUserDTO {
  @IsEmail({}, { message: 'Email must be valid' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
