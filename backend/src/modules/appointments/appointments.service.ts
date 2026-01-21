/**
 * Appointments Service
 * 
 * @description
 * Handles services related to appointments.
 * Provides functions for creating, retrieving, updating, and deleting appointments.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment, AppointmentStatus } from '../../database/entities/appointment.entity';
import { User } from '../../database/entities/user.entity';
import { CreateAppointmentDTO, UpdateAppointmentDTO } from './dtos';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new appointment
   * @throws NotFoundException if user doesn't exist
   * @throws BadRequestException if end time is before start time
   * @throws ConflictException if time slot overlaps with existing appointment
   */
  async create(createAppointmentDTO: CreateAppointmentDTO): Promise<Appointment> {
    // Validate times
    const startTime = new Date(createAppointmentDTO.startTime);
    const endTime = new Date(createAppointmentDTO.endTime);

    if (endTime <= startTime) {
      throw new BadRequestException('End time must be after start time');
    }

    // Verify user exists
    const user = await this.usersRepository.findOne({
      where: { id: createAppointmentDTO.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createAppointmentDTO.userId} not found`);
    }

    // Check for overlapping appointments (unless admin explicitly allows overlap)
    if (!createAppointmentDTO.allowOverlap) {
      const overlappingAppointments = await this.appointmentsRepository
        .createQueryBuilder('appointment')
        .where('appointment.date < :endTime', { endTime })
        .andWhere('appointment.endDate > :startTime', { startTime })
        .getMany();

      if (overlappingAppointments.length > 0) {
        throw new ConflictException(
          'This time slot overlaps with an existing appointment. Please choose a different time.'
        );
      }
    }

    const appointment = this.appointmentsRepository.create({
      title: createAppointmentDTO.title,
      description: createAppointmentDTO.description,
      date: startTime,
      endDate: endTime,
      user,
    });

    return await this.appointmentsRepository.save(appointment);
  }

  /**
   * Get all appointments
   */
  async findAll(): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      relations: ['user'],
    });
  }

  /**
   * Get appointments by date
   */
  async findByDate(date: string): Promise<Appointment[]> {
    const startOfDay = new Date(`${date}T00:00:00Z`);
    const endOfDay = new Date(`${date}T23:59:59Z`);

    return await this.appointmentsRepository.find({
      where: {
        date: Between(startOfDay, endOfDay),
      },
      relations: ['user'],
    });
  }

  /**
   * Get appointment by ID
   * @throws NotFoundException if appointment doesn't exist
   */
  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  /**
   * Get appointments by user ID
   */
  async findByUserId(userId: string): Promise<Appointment[]> {
    return await this.appointmentsRepository.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { date: 'ASC' },
    });
  }

  /**
   * Get available time slots for a given date
   * Accounts for both start and end times of scheduled appointments
   */
  async getAvailableTimeSlots(date: string): Promise<string[]> {
    const openingHour = 9;
    const closingHour = 17;
    const slotDurationMinutes = 60; // 1 hour slots
    
    // Parse the date string as local time (expected format: YYYY-MM-DD)
    const [year, month, day] = date.split('-').map(Number);
    
    // Create start and end of day in local time, then convert to UTC for DB query
    const startOfDayLocal = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDayLocal = new Date(year, month - 1, day, 23, 59, 59, 999);

    // Get all appointments for the day
    const appointments = await this.appointmentsRepository.find({
      where: {
        date: Between(startOfDayLocal, endOfDayLocal),
      },
    });

    const availableSlots: string[] = [];

    // Generate all possible slots in local time
    for (let hour = openingHour; hour < closingHour; hour++) {
      // Create slot times in local timezone
      const slotStartTime = new Date(year, month - 1, day, hour, 0, 0, 0);
      const slotEndTime = new Date(slotStartTime.getTime() + slotDurationMinutes * 60 * 1000);
      
      // Check if this slot overlaps with any appointment
      const isBooked = appointments.some(apt => {
        const aptStart = new Date(apt.date);
        const aptEnd = new Date(apt.endDate);
        
        // Slot overlaps if: appointment ends after slot starts AND appointment starts before slot ends
        return aptEnd > slotStartTime && aptStart < slotEndTime;
      });

      if (!isBooked) {
        // Return time in HH:MM format instead of ISO string
        availableSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    }

    return availableSlots;
  }

  /**
   * Update appointment
   */
  async update(id: string, updateAppointmentDTO: UpdateAppointmentDTO): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Validate times if both are provided
    if (updateAppointmentDTO.startTime && updateAppointmentDTO.endTime) {
      const startTime = new Date(updateAppointmentDTO.startTime);
      const endTime = new Date(updateAppointmentDTO.endTime);

      if (endTime <= startTime) {
        throw new BadRequestException('End time must be after start time');
      }
    }

    Object.assign(appointment, updateAppointmentDTO);
    return await this.appointmentsRepository.save(appointment);
  }

  /**
   * Mark appointment as completed
   */
  async markAsCompleted(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.markAsCompleted();
    return await this.appointmentsRepository.save(appointment);
  }

  /**
   * Cancel appointment
   */
  async cancel(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.markAsCancelled();
    return await this.appointmentsRepository.save(appointment);
  }

  /**
   * Delete appointment
   */
  async remove(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    return await this.appointmentsRepository.remove(appointment);
  }

  /**
   * Get appointment load by date (for admin dashboard)
   */
  async getLoadByDate(startDate: string, endDate: string) {
    const appointments = await this.appointmentsRepository.find({
      where: {
        date: Between(new Date(startDate), new Date(endDate)),
        status: AppointmentStatus.SCHEDULED,
      },
    });

    // Group by date
    const groupedByDate = appointments.reduce((acc, apt) => {
      const dateKey = apt.date.toISOString().split('T')[0];
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return groupedByDate;
  }
}
