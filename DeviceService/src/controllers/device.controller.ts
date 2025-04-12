import { NextFunction, Request, Response } from "express";
import deviceService from "../services/device.service";
import logger from "../utils/logger";
import { handleResponse } from "../middlewares/reponse.handler";
import { get } from "http";

/**
 * @desc Create a new device
 * @route POST /devices
 * @access Private
 */
const createDevice = async (req: Request, res: Response, next: NextFunction) => { 
  try {
    const deviceData = req.body;
    const newDevice = await deviceService.addDevice(deviceData);
    handleResponse(res, 201, "Device created successfully", newDevice);
    logger.info("Device created successfully", newDevice);
  } catch (error) {
    console.error('Error creating device:', error);
    logger.error('Error creating device:', error);
    next(error);
  }
}

const getDevices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const devices = await deviceService.getDevices(req.query);
    handleResponse(res, 200, "Devices fetched successfully", devices);
    logger.info("Devices fetched successfully", devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    logger.error('Error fetching devices:', error);
    next(error);
  }
}


export default {
  createDevice,
  getDevices
}