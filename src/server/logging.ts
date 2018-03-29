import winston = require("winston");
import { settings } from "./helper";

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

/**winston.configure({
  level: "silly",
  transports: [
    new winston.transports.Console({
      colorize: true
    })
  ]
});

winston.configure({
  level: "debug",
  transports: [
    new winston.transports.Console({
      colorize: true
    })
  ]
});

winston.configure({
  level: "verbose",
  transports: [
    new winston.transports.Console({
      colorize: true
    })
  ]
});

winston.configure({
  level: "info",
  transports: [
    new winston.transports.Console({
      colorize: true
    })
  ]
});

winston.configure({
  level: "warn",
  transports: [
    new winston.transports.Console({
      colorize: true
    }),
    new winston.transports.File({
      filename: "log.log"
    })
  ]
});

winston.configure({
  level: "error",
  transports: [
    new winston.transports.Console({
      colorize: true
    })
  ]
});**/
