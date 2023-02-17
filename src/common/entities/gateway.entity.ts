import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { IGatewayInfo } from '@common/interfaces/gateway.interface';
import { GATEWAY_TYPE, NETWORK_STATE, SENSOR_STATE } from '@common/enums';

@Entity({ name: 'gateway_info' })
export class GatewayInfo extends BaseEntity implements IGatewayInfo {
  @PrimaryColumn({ length: 20 })
  id: string;

  @Column({ length: 50, nullable: false })
  name: string;

  @Column({ length: 255, nullable: false })
  address: string;

  @Column({ length: 20, nullable: false })
  latitude: string;

  @Column({ length: 20, nullable: false })
  longitude: string;

  @Column({
    enum: GATEWAY_TYPE,
    length: 20,
    nullable: false,
    default: GATEWAY_TYPE.STATIC,
  })
  type: GATEWAY_TYPE;

  @Column({
    enum: SENSOR_STATE,
    name: 'sensor_state',
    length: 10,
    nullable: false,
    default: SENSOR_STATE.NORMAL,
  })
  sensorState: SENSOR_STATE;

  @Column({
    enum: NETWORK_STATE,
    name: 'network_state',
    length: 10,
    nullable: false,
    default: NETWORK_STATE.IDLE,
  })
  networkState: NETWORK_STATE;

  @Exclude()
  @Column({ length: 1, name: 'use_yn', nullable: false, default: 'N' })
  useYn: string;

  @Expose()
  get available(): boolean {
    return this.useYn?.toUpperCase() == 'Y';
  }

  @Column({ length: 255, name: 'serial_no', nullable: false })
  serial: string;

  @Column({ length: 9, name: 'group_id', nullable: false })
  groupId: string;

  @Column({ length: 255, name: 'cpu_name', nullable: false })
  cpuName: string;

  @Column({ length: 255, name: 'cpu_max_clock_speed', nullable: false })
  cpuMaxClockSpeed: string;

  @Column({ type: 'float8', name: 'cpu_usage', nullable: false })
  cpuUsage: number;

  @Column({ type: 'int4', name: 'cpu_count', nullable: false })
  cpuCount: number;

  @Column({ type: 'float8', name: 'memory_total_size', nullable: false })
  memoryTotalSize: number;

  @Column({ type: 'float8', name: 'memory_free_size', nullable: false })
  memoryFreeSize: number;

  @Column({ type: 'float8', name: 'memory_used_size', nullable: false })
  memoryUsedSize: number;

  @Column({ type: 'float8', name: 'memory_usage', nullable: false })
  memoryUsage: number;

  @Exclude()
  @Column({ length: 1, name: 'is_warning', nullable: false, default: 'N' })
  isWarning: string;

  @Expose()
  get warned(): boolean {
    return this.isWarning?.toUpperCase() == 'Y';
  }

  @Column({ length: 20, name: 'weather_id', nullable: false })
  weatherId: string;

  @CreateDateColumn({ name: 'reg_date' })
  registeredAt: Date;

  @UpdateDateColumn({ name: 'last_update' })
  modifiedAt: Date;
}
