import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  gender: string;

  @Column({ nullable: true })
  photo: string;
}
