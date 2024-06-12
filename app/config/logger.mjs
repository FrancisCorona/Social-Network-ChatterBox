/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 3
* Due: 6/13/24, 11:59 PM EDT
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