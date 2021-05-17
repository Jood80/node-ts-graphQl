import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Profile } from './Profile';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  firstName: string;

  @Column({ type: 'varchar', length: '230' })
  lastName: string;

  @Column()
  age: number;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'boolean', default: false })
  isConfirmed: boolean;

  @Column({ type: 'int', nullable: true })
  ProfileId: number;
  
  @OneToOne(() => Profile, (entity) => entity.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ProfileId' })
  profile: Profile;

}
