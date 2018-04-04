import winston = require("winston");
import { settings } from "./helper";

/**
 * Custom winston logging-object.
 * @author Andrej Resanovic
 */
let logger: any = new winston.Logger({
  transports: [
    new winston.transports.File({
      filename: "logs/logging.log",
      handleExceptions: true,
      humanReadableUnhandledException: true,
      json: true,
      maxsize: 5242880 * 2,
      colorize: false
    }),
    new winston.transports.Console({
      colorize: true,
      timestamp: true,
      handleExceptions: true,
      humanReadableUnhandledException: true,
      level: settings.server.logging_level
    })
  ]
});
logger.exitOnError = true;

export { logger };
