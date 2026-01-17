import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDTO, UpdateUserDTO } from './dtos';
import { User } from '../../database/entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * POST /users
   * Create a new user
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDTO: CreateUserDTO): Promise<User> {
    return await this.usersService.create(createUserDTO);
  }

  /**
   * GET /users
   * Get all users
   */
  @Get()
  async findAll(): Promise<User[]> {
    return await this.usersService.findAll();
  }

  /**
   * GET /users/:id
   * Get user by ID with their appointments
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return await this.usersService.findOne(id);
  }

  /**
   * PATCH /users/:id
   * Update user
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDTO: UpdateUserDTO,
  ): Promise<User> {
    return await this.usersService.update(id, updateUserDTO);
  }

  /**
   * DELETE /users/:id
   * Delete user and cascade delete appointments
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
