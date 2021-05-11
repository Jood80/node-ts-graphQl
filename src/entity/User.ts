import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
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
}
