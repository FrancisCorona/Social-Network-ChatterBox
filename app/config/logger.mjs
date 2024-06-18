/*
* Francis Corona & Ian Stewart
* Social Network - Final Project
*/

import winston from 'winston';

const createLogger = (moduleName) => {
    return winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.label({ label: moduleName }),
            winston.format.printf(({ level, message, label }) => {
                return `${level}: [${label}] ${message}`;
            })
        ),
        transports: [
            new winston.transports.File({ filename: 'logs/combined.log' }),
            new winston.transports.Console()
        ],
    });
};

export default createLogger;