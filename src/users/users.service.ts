import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './entities/user.entity'
import * as bcrypt from 'bcrypt'
import { CreateUser } from './types/user.type'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async updateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
    await this.usersRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    })
  }
  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username })
  }

  async validateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<boolean> {
    const user = await this.findOne(userId)
    if (!user || !user.refreshToken) return false
    return bcrypt.compare(refreshToken, user.refreshToken)
  }

  async create({
    username,
    email,
    password,
    firstName,
    lastName,
  }: CreateUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = this.usersRepository.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
    })
    return this.usersRepository.save(user)
  }

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ username })
    if (user && (await bcrypt.compare(password, user.password))) {
      return user
    }
    return null
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id })
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
  }

  async update(id: number, attrs: Partial<User>): Promise<User> {
    const user = await this.findOne(id)
    Object.assign(user, attrs)
    return this.usersRepository.save(user)
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id)
    await this.usersRepository.remove(user)
  }
}
