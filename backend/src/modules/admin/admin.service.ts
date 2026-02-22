/**
 * Advocates Service
 * 
 * @description
 * Handles services related to admin activity.
 * Provides functions for creating, retrieving, updating, and deleting users, appointments
 * and admin settings.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-02-20
 *
 */
import { Injectable, NotFoundException, ConflictException, OnModuleInit, Redirect } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Advocate } from '../../database/entities/advocate.entity';
import { Appointment } from '../../database/entities/appointment.entity';
import { User, UserRole } from '../../database/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(Advocate)
        private readonly advocatesRepository: Repository<Advocate>,
        @InjectRepository(Appointment)
        private readonly appointmentsRepository: Repository<Appointment>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly jwtService: JwtService
    ) {}

    /**
     * Authorize admin user
     * @param id - Admin user ID
     * @param auth - Authentication token or password
     * @returns JWT token if authorized, null otherwise
     */
    async authorizeAdmin(id: string, auth: string): Promise<string | null> {
        const adminUser = await this.userRepository.findOne({ where: { email: id, role: UserRole.ADMIN } });
        if (!adminUser) {
            return null; // No admin user found with the given ID
        }
        if (auth !== adminUser.admin_password) {
            return null; // Incorrect password
        }
        // Payload for JWT
        const payload = { sub: adminUser.id, email: adminUser.email, role: adminUser.role };
        return this.jwtService.sign(payload);
    }

    async createAdmin(id: string, auth: string, name: string = 'Admin'): Promise<boolean> {
        const existingAdmin = await this.userRepository.findOne({ where: { email: id } });
        if (existingAdmin) {
            throw new ConflictException('Admin user with this email already exists');
        }
        const newAdmin = this.userRepository.create({
            email: id,
            admin_password: auth,
            role: UserRole.ADMIN,
            name: name
        });
        await this.userRepository.save(newAdmin);
        return true;
    }

    async getAdminAppointments(date?: string, future?: boolean): Promise<Appointment[]> {
        const query = this.appointmentsRepository.createQueryBuilder('appointment')
            .leftJoinAndSelect('appointment.advocate', 'advocate')
            .leftJoinAndSelect('appointment.user', 'user');

        if (date) {
            query.andWhere('DATE(appointment.date) = :date', { date });
        }
        if (future) {
            query.andWhere('appointment.date > NOW()');
        }
        return await query.getMany();
    }
}