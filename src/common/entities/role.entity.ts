import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @PrimaryColumn({ name: 'id', length: 4 })
  id: string;

  @Column({ length: 50, nullable: false })
  name: string;

  @Exclude()
  @Column({ length: 1, name: 'use_yn', nullable: false, default: 'N' })
  useYn: string;

  @Expose()
  get available(): boolean {
    return this.useYn?.toUpperCase() == 'Y';
  }
}
