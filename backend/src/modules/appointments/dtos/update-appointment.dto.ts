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
