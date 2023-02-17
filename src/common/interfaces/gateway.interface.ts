import type { GATEWAY_TYPE, NETWORK_STATE, SENSOR_STATE } from '@common/enums';

export interface IGatewayInfo {
  id: string;
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  type: GATEWAY_TYPE;
  sensorState: SENSOR_STATE;
  networkState: NETWORK_STATE;
  available: boolean;

  deviceCode?: string; // 씀?
  serial: string;

  groupId: string;
  cpuName: string;
  cpuMaxClockSpeed: string;
  cpuUsage: number;
  cpuCount: number;
  memoryTotalSize: number;
  memoryFreeSize: number;
  memoryUsedSize: number;
  memoryUsage: number;

  warned: boolean;
  weatherId: string;

  registeredAt: Date;
  modifiedAt: Date;
}
