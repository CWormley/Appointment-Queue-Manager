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

  /**
   * GET /appointments
   * Get all appointments or filter by date
   * Query: ?date=2026-01-15
   */
  @Get()
  async findAll(@Query('date') date?: string): Promise<Appointment[]> {
    if (date) {
      return await this.appointmentsService.findByDate(date);
    }
    return await this.appointmentsService.findAll();
  }

  /**
   * GET /appointments/load
   * Get appointment load by date range (admin)
   * Query: ?startDate=2026-01-01&endDate=2026-01-31
   */
  @Get('admin/load')
  async getLoadByDate(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.appointmentsService.getLoadByDate(startDate, endDate);
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
   * PATCH /appointments/:id/complete
   * Mark appointment as completed (admin)
   */
  @Patch(':id/complete')
  async markAsCompleted(@Param('id') id: string): Promise<Appointment> {
    return await this.appointmentsService.markAsCompleted(id);
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
