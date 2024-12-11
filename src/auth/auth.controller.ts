import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UsersService } from 'src/users/users.service'
import { CreateUser } from 'src/users/types/user.type'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('refresh-token')
  async refreshToken(@Body() body: { userId: number; refreshToken: string }) {
    const { userId, refreshToken } = body
    return this.authService.refreshToken(userId, refreshToken)
  }

  @Post('login')
  async login(@Body() body: { username: string; password: string }) {
    const { username, password } = body
    const user = await this.usersService.validateUser(username, password)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    return this.authService.generateTokens(user.id, user.email)
  }

  @Post('signup')
  async signup(@Body() body: CreateUser) {
    const { username, email, password, firstName, lastName } = body
    const user = await this.usersService.create({
      username,
      email,
      password,
      firstName,
      lastName,
    })
    return this.authService.generateTokens(user.id, user.email)
  }
}
