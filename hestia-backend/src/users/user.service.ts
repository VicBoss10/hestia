import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'; //npm install @nestjs/typeorm typeorm

import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.userRepository.find();
    return users;
  }

  async getUserById(id: number) {
    const user = await this.findOne(id);
    return user;
  }

  async create(body: CreateUserDto) {
    const newUser = await this.userRepository.save(body);
    return newUser;
  }

  async delete(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.delete(user.id);
    return {
      message: 'User deleted successfully',
    };
  }

  async update(id: number, changes: UpdateUserDto) {
    const user = await this.findOne(id);
    const updateUser = this.userRepository.merge(user, changes);
    return this.userRepository.save(updateUser);
  }

  async getUserByFirebaseUid(firebaseUid: string) {
    const user = await this.userRepository.findOne({ where: { firebaseUid } });
    if (!user) {
      throw new NotFoundException(`User with Firebase UID ${firebaseUid} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async ensureAdminExists(email: string, username: string) {
    // Check if user exists
    let user = await this.userRepository.findOne({ where: { email } });
    
    if (user) {
      // Update to admin if not already
      if (user.role !== 'admin') {
        user.role = 'admin';
        await this.userRepository.save(user);
        return { 
          message: 'User updated to admin', 
          user: { id: user.id, username: user.username, email: user.email, role: user.role }
        };
      }
      return { 
        message: 'User already exists as admin', 
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      };
    }
    
    // Create new admin user
    const newUser = this.userRepository.create({
      username,
      email,
      role: 'admin',
      firebaseUid: undefined
    });
    await this.userRepository.save(newUser);
    
    return { 
      message: 'Admin user created successfully', 
      user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
    };
  }

  private async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
}
