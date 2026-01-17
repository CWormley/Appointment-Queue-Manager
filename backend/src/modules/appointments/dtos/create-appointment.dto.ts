import { IsNotEmpty, IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreateAppointmentDTO {
  @IsString()
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString({}, { message: 'Start time must be a valid ISO date' })
  @IsNotEmpty({ message: 'Start time is required' })
  startTime: string;

  @IsDateString({}, { message: 'End time must be a valid ISO date' })
  @IsNotEmpty({ message: 'End time is required' })
  endTime: string;

  @IsUUID()
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;
}
