/**
 * Create User DTO
 * 
 * @description
 * Data Transfer Object for creating a new user.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
import { IsEmail, IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../../database/entities/user.entity';

export class CreateUserDTO {
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole = UserRole.USER;
}
