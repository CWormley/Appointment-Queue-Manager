/**
 * Update Appointment DTO
 * 
 * @description
 * Data Transfer Object for updating an existing appointment.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
import { IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class UpdateAppointmentDTO {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'Start time must be a valid ISO date' })
  @IsOptional()
  startTime?: string;

  @IsDateString({}, { message: 'End time must be a valid ISO date' })
  @IsOptional()
  endTime?: string;
}
