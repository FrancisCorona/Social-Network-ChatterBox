import winston from 'winston';

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	defaultMeta: { service: 'user-service' },
	transports: [
		new winston.transports.File({ filename: 'logs/combined.log' }),
		new winston.transports.Console({ format: winston.format.simple(), }),
	],
});

export default logger;