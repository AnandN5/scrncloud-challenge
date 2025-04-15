import axios from 'axios';
import logger from '../utils/logger';
import { Device } from '../interfaces/device.interface';
import { ServiceDiscovery } from '../utils/constants';

export const getDeviceById = async (device_id: string): Promise<Device> => {
  try {
    const response = await axios.get(`${ServiceDiscovery.DEVICE_SERVICE}/`, { params: { id: device_id } });
    const device = response.data.data[0];
    device.device_id = response.data.data[0].id;
    return device;
  } catch (error) {
    logger.error('Error fetching devices:', error);
    throw new Error('Failed to fetch devices from DeviceService');
  }
};

export default {
    getDeviceById,
};