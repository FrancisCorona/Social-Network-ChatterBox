/*
* Group: Francis Corona, Ian Stewart
* Project: Social Network - Phase 2
* Due: 6/4/24, 11:59 PM EDT
*/

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