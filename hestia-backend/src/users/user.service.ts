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

  private async findOne(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }
}
