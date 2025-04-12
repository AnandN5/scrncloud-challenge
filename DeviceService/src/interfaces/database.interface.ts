import { Device, DeviceFilters } from "./device.interface";

export interface Repository {
    getDevices(options?: DeviceFilters): Promise<Device[]>;
    addDevice(device: Device): Promise<Device>;
  }