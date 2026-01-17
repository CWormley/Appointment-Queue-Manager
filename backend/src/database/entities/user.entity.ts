/**
 * User Entity
 *
 * @description
 * Represents a user in the system. Users can have multiple appointments.
 * This entity defines the structure of the 'users' table in PostgreSQL.
 *
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-13
 *
 * @example
 * const user = new User();
 * user.email = 'john@example.com';
 * user.name = 'John Doe';
 * user.role = UserRole.USER;
 */

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  Unique,
} from 'typeorm';
import { Appointment } from './appointment.entity';

/**
 * User roles enumeration
 * Defines different permission levels within the application
 */
export enum UserRole {
  /** Standard user - can only manage their own appointments */
  USER = 'user',
  /** Administrator - can manage all appointments and view analytics */
  ADMIN = 'admin',
}

/**
 * User Entity
 *
 * Maps to the 'users' table in the database.
 * One User can have Many Appointments (one-to-many relationship).
 *
 * @property {string} id - Unique identifier (auto-generated UUID)
 * @property {string} email - User email address (unique, indexed)
 * @property {string} name - User's full name
 * @property {UserRole} role - User's role/permission level
 * @property {Date} createdAt - Timestamp when user was created (auto-generated)
 * @property {Date} updatedAt - Timestamp when user was last updated (auto-generated)
 * @property {Appointment[]} appointments - All appointments belonging to this user
 */
@Entity('users')
@Index(['email']) // Create database index on email for faster lookups
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];

  /**
   * Instance Methods
   */

  /**
   * Check if user is an administrator
   *
   * @returns {boolean} True if user role is ADMIN
   * @example
   * if (user.isAdmin()) {
   *   // Show admin controls
   * }
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Get user display name
   *
   * @returns {string} User's full name
   * @example
   * console.log(user.getDisplayName()); // "John Doe"
   */
  getDisplayName(): string {
    return this.name;
  }

  /**
   * Check if user created a specific appointment
   *
   * @param {string} appointmentId - The appointment ID to check
   * @returns {boolean} True if this user owns the appointment
   * @example
   * if (user.ownsAppointment(appointmentId)) {
   *   // Allow user to edit/delete
   * }
   */
  ownsAppointment(appointmentId: string): boolean {
    if (!this.appointments) return false;
    return this.appointments.some((apt) => apt.id === appointmentId);
  }
}
