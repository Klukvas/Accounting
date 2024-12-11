import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ nullable: true })
  username?: string

  @Column()
  email: string

  @Column()
  password: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @CreateDateColumn({ type: 'timestamp' })
  registeredAt: Date

  @Column({ nullable: true })
  refreshToken?: string

  @Column({ nullable: true })
  income?: number
}
