/**
 * Advocates Controller
 * 
 * @description
 * Handles HTTP requests related to admin activity.
 * Provides secure endpoints for creating, retrieving, updating, and deleting appontments, 
 * users, and admin settings.
 * Utilizes AdvocatesService for business logic.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-02-20
 *
 */
import {
    Controller,
    UseGuards,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    Res,
    Get,
    Query
} from '@nestjs/common';
import type { Response } from 'express';
import {AdminService} from './admin.service'
import { AuthorizeAdminDTO } from './dtos/index'; 
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserRole } from 'src/database/entities/user.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { App } from 'supertest/types';
import { Appointment } from 'src/database/entities/appointment.entity';

@Controller('admin')
export class AdminController{
    constructor(private readonly adminService: AdminService) {}
     /**
      * POST /admin/auth/login
      * @description
      * Authenticates an admin user and returns a JWT token if successful.
      * @param authorizeAdminDTO - DTO containing admin email and password
      * @returns Object with success status and JWT token if authorized
      */
     @Post()
     @HttpCode(HttpStatus.ACCEPTED)
     async login(@Body() authorizeAdminDTO: AuthorizeAdminDTO, @Res() res: Response) {
        const { id, auth } = authorizeAdminDTO;
        const JWT = await this.adminService.authorizeAdmin(id, auth);
        if (JWT) {
            res.setHeader('Authorization', `Bearer ${JWT}`);
            return res.status(HttpStatus.ACCEPTED).json({ success: true });
        } else {
            return res.status(HttpStatus.UNAUTHORIZED).json({ success: false });
        }
     }

     /**
     * POST create a new admin user
     * @param createAdminDTO - DTO containing admin credentials
     * @returns boolean indicating success of admin creation
     * @description
     * Endpoint to create a new admin user. Requires authentication and authorization.
     */
    @Post('create')
    @UseGuards(JwtAuthGuard, RolesGuard) // Ensure only authenticated admins can access this endpoint
    @Roles(UserRole.ADMIN)
    @HttpCode(HttpStatus.CREATED)
    async createAdmin(@Body() authorizeAdminDTO: AuthorizeAdminDTO, @Res() res: Response){
        const { id, auth, name } = authorizeAdminDTO;
        const result = await this.adminService.createAdmin(id, auth, name);
        if (!result) {
            return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'Admin creation failed' });
        }
        return res.status(HttpStatus.CREATED).json({ success: true });
    }

    @Get('appointments')
    @UseGuards(JwtAuthGuard, RolesGuard) // Ensure only authenticated admins can access this endpoint
    @Roles(UserRole.ADMIN)
     async getAdminAppointments(@Query('date') date?: string, @Query('future') future?: boolean): Promise<Appointment[]> {
        return this.adminService.getAdminAppointments(date, future);
     }
}
