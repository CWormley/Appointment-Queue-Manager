/**
 * Users Service
 * 
 * @description
 * Handles services related to users.
 * Provides functions for creating, retrieving, updating, and deleting users.
 * 
 * @author Claudia Wormley
 * @version 1.0.0
 * @since 2026-01-20
 *
 */
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { CreateUserDTO, UpdateUserDTO } from './dtos';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Create a new user
   * @throws ConflictException if email already exists
   */
  async create(createUserDTO: CreateUserDTO): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDTO.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const user = this.usersRepository.create(createUserDTO);
    return await this.usersRepository.save(user);
  }

  /**
   * Get all users
   */
  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  /**
   * Get user by ID
   * @throws NotFoundException if user doesn't exist
   */
  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['appointments'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Get user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({
      where: { email },
    });
  }

  /**
   * Update user
   * @throws NotFoundException if user doesn't exist
   * @throws ConflictException if email already in use by another user
   */
  async update(id: string, updateUserDTO: UpdateUserDTO): Promise<User> {
    const user = await this.findOne(id);

    // Check if email is already in use by another user
    if (updateUserDTO.email && updateUserDTO.email !== user.email) {
      const existingUser = await this.findByEmail(updateUserDTO.email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    Object.assign(user, updateUserDTO);
    return await this.usersRepository.save(user);
  }

  /**
   * Delete user
   * Cascade deletes all user's appointments
   * @throws NotFoundException if user doesn't exist
   */
  async remove(id: string): Promise<User> {
    const user = await this.findOne(id);
    return await this.usersRepository.remove(user);
  }
}
