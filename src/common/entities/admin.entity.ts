import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { IAdmin } from '@common/interfaces';

@Entity({ name: 'admin' })
export class Admin extends BaseEntity implements IAdmin {
  @PrimaryColumn({ name: 'admin_id', length: 320 })
  id: string;

  @Exclude()
  @Column({ type: 'bytea', nullable: false, name: 'password_hash' })
  password: string;

  @Exclude()
  @Column({ type: 'bytea', nullable: false, name: 'password_salt' })
  salt: string;

  @Column({ length: 45, nullable: false })
  name: string;

  @Exclude()
  @Column({ length: 1, name: 'use_yn', nullable: false, default: 'N' })
  useYn: string;

  @Column({ length: 30, nullable: true, default: '' })
  permission: string;

  @Expose()
  get available(): boolean {
    return this.useYn?.toUpperCase() == 'Y';
  }

  @CreateDateColumn({ name: 'reg_date' })
  createdAt: Date;

  @Column({ length: 100, name: 'darkmode', nullable: true, default: '' })
  layoutMode: string;
}
