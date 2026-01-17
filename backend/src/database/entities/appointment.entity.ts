/**
 * Appointment Entity
 *
 * @description
 * Represents an appointment in the system. Appointments are linked to users.
 * This entity defines the structure of the 'appointments' table in PostgreSQL.
 *
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-13
 *
 * @example
 * const appointment = new Appointment();
 * appointment.date = new Date('2026-02-01T10:00:00Z');
 * appointment.endDate = new Date('2026-02-01T11:00:00Z');
 * appointment.status = AppointmentStatus.SCHEDULED;
 * appointment.user = someUser;
 */
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

/**
 * Appointment status enumeration
 * Defines different states an appointment can be in
 */
export enum AppointmentStatus {
  /** Appointment is scheduled and upcoming */
  SCHEDULED = 'scheduled',
  /** Appointment has been completed */
  COMPLETED = 'completed',
  /** Appointment was cancelled */
  CANCELLED = 'cancelled',
}

/**
 * Appointment Entity
 *
 * Maps to the 'appointments' table in the database.
 * Many Appointments belong to One User (many-to-one relationship).
 *
 * @property {string} id - Unique identifier (auto-generated UUID)
 * @property {Date} date - Date and time of the appointment
 * @property {Date} endDate - End date and time of the appointment
 * @property {AppointmentStatus} status - Current status of the appointment
 * @property {Date} createdAt - Timestamp when appointment was created (auto-generated)
 * @property {Date} updatedAt - Timestamp when appointment was last updated (auto-generated)
 * @property {User} user - The user to whom this appointment belongs
 */
@Entity('appointments')
export class Appointment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'text' })    
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'timestamptz' })
    date: Date;

    @Column({ type: 'timestamptz' })
    endDate: Date;
    
    @Column({type: 'enum', enum: AppointmentStatus, default: AppointmentStatus.SCHEDULED})
    status: AppointmentStatus;
    
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.appointments, { onDelete: 'CASCADE' })
    user: User;

    /*
     * Instance Methods
     */

    /**
     * Complete Appointment
     * Marks the appointment as completed.
     * @returns {void}
     */
    markAsCompleted() {
      this.status = AppointmentStatus.COMPLETED;    
    }

    /**
     * Cancel Appointment
     * Marks the appointment as cancelled.
     * @returns {void}
     */
    markAsCancelled() {
      this.status = AppointmentStatus.CANCELLED;    
    }

    /**
     * Check if this appointment overlaps with another appointment
     * @param {Appointment} other - Another appointment to check against
     * @returns {boolean} True if the appointments overlap, false otherwise
     */
    overlaps(other: Appointment): boolean {
        return this.date < other.endDate && this.endDate > other.date;
    }

    /**
     * Get Time Remaining
     * Calculates the time remaining until the appointment starts, in minutes.
     * @returns {number} Time remaining in minutes
     */
    getTimeRemaining(): number {
      const now = new Date();
      return Math.round((this.date.getTime() - now.getTime()) / (1000 * 60));
    }

}

