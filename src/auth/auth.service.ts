import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from 'src/users/users.service'

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async generateTokens(userId: number, username: string) {
    const payload = { sub: userId, username }
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' })
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' })

    // Save the hashed refresh token in the user's record
    await this.usersService.updateRefreshToken(userId, refreshToken)

    return { accessToken, refreshToken }
  }

  async refreshToken(userId: number, refreshToken: string) {
    const isValid = await this.usersService.validateRefreshToken(
      userId,
      refreshToken,
    )
    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }

    const user = await this.usersService.findOne(userId)
    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    return this.generateTokens(user.id, user.email)
  }
}
