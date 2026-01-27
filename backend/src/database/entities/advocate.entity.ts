/**
 * Advocate Entity
 *
 * @description
 * Represents an advocate in the system. Advocates are linked to appointments.
 * This entity defines the structure of the 'advocates' table in PostgreSQL.
 *
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-25
 *
 * @example
 * const advocate = new Advocate();
 * advocate.name = "Jane Doe";
 * advocate.email = "jane.doe@example.com";
 * advocate.phone = "123-456-7890";
 */
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
}from 'typeorm';
import { Appointment } from './appointment.entity';

/**
 * Advocate Entity
 *
 * Maps to the 'advocates' table in the database.
 * One Advocate can have Many Appointments (one-to-many relationship).
 *
 * @property {string} id - Unique identifier (auto-generated UUID)
 * @property {string} name - Full name of the advocate
 * @property {string} email - Email address of the advocate
 * @property {string} phone - Phone number of the advocate
 * @property {Appointment[]} appointments - List of appointments associated with this advocate
 */
@Entity('advocates')
export class Advocate{
    @PrimaryGeneratedColumn('uuid')
    id: string;
    
    @Column({type: 'varchar', length: 100})
    name: string;
    
    @Column({type: 'varchar', length: 100, unique: true})
    email: string;
    
    @Column({type: 'varchar', length: 15, nullable: true})
    phone: string;
    
    @OneToMany(() => Appointment, appointment => appointment.advocate)
    appointments: Appointment[];
}