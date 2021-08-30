const { createLogger, format, transports, config } = require('winston');

const logConfiguration = {
    // levels: config.syslog.levels,
    transports:
        [
            new transports.File({
                level: 'info',

                filename: `${__dirname}/../logs/server.log`,
                format: format.combine(
                    format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                    format.align(),
                    format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
                )
            }),
            new transports.Console({
                level: 'error',
                format: format.combine(
                    format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                    format.align(),
                    format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
                )
            }),
        ],
}

const logger = createLogger(logConfiguration);

module.exports = logger;
