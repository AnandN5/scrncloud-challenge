import path from "path";
import { createLogger, format, transports } from "winston";

const logger = createLogger({
  // Set the default log level (e.g., 'info', 'debug', 'error')
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.printf(
      ({ timestamp, level, message }) =>
        `${timestamp} [${level.toUpperCase()}]: ${message}`
    )
  ),
  transports: [
    new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
      level: "all",
    }), // Log to the console
    new transports.File({
      filename: path.join(__dirname, "../logs/error.log"),
      level: "error",
    }),
    new transports.File({
      filename: path.join(__dirname, "../logs/info.log"),
      level: "info",
    }),
    new transports.File({
      filename: path.join(__dirname, "../logs/warning.log"),
      level: "warn",
    }),
    new transports.File({
      filename: path.join(__dirname, "../logs/debug.log"),
      level: "debug",
    }),
    new transports.File({
      filename: path.join(__dirname, "../logs/combined.log"),
    }),
  ],
});

export default logger;
