import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class Profile extends BaseEntity {
  @PrimaryGeneratedColumn()
  public ProfileId: number;

  @Column()
  gender: string;

  @Column({ nullable: true })
  photo: string;
}
