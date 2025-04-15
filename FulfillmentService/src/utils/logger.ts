import { createLogger, format, transports } from 'winston';

const logger = createLogger({
    // Set the default log level (e.g., 'info', 'debug', 'error')
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.printf(({ timestamp, level, message }) => `${timestamp} [${level.toUpperCase()}]: ${message}`)
    ),
    transports: [
        new transports.Console(), // Log to the console
        new transports.File({ filename: '../logs/error.log', level: 'error' }), // Log errors to a file
        new transports.File({ filename: '../logs/combined.log' }) // Log all messages to a file
    ]
});

export default logger
