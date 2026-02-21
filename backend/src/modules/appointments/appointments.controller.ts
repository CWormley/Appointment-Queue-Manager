/**
 * Appointments Controller
 * 
 * @description
 * Handles HTTP requests related to appointments.
 * Provides endpoints for creating, retrieving, updating, and deleting appointments.
 * Utilizes AppointmentsService for business logic.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
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
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDTO, UpdateAppointmentDTO } from './dtos';
import { Appointment } from '../../database/entities/appointment.entity';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  /**
   * POST /appointments
   * Create a new appointment
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAppointmentDTO: CreateAppointmentDTO): Promise<Appointment> {
    return await this.appointmentsService.create(createAppointmentDTO);
  }

  @Get('available-time-slots')
  async getAvailableTimeSlots(@Query('date') date: string) {
    return await this.appointmentsService.getAvailableTimeSlots(date);
  }

  /**
   * GET /appointments/user/:userId
   * Get all appointments for a specific user
   */
  @Get('user/:userId')
  async findByUserId(@Param('userId') userId: string): Promise<Appointment[]> {
    return await this.appointmentsService.findByUserId(userId);
  }

  /**
   * GET /appointments/:id
   * Get appointment by ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Appointment> {
    return await this.appointmentsService.findOne(id);
  }

  /**
   * PATCH /appointments/:id
   * Update appointment
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDTO: UpdateAppointmentDTO,
  ): Promise<Appointment> {
    return await this.appointmentsService.update(id, updateAppointmentDTO);
  }
  
  /**
   * PATCH /appointments/:id/cancel
   * Cancel appointment
   */
  @Patch(':id/cancel')
  async cancel(@Param('id') id: string): Promise<Appointment> {
    return await this.appointmentsService.cancel(id);
  }

  /**
   * DELETE /appointments/:id
   * Delete appointment
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.appointmentsService.remove(id);
  }
}
