import winston = require("winston");

let logger: winston.LoggerInstance = new winston.Logger({
  transports: [
    new winston.transports.File({
      level: "info",
      filename: "logs/logging.log",
      handleExceptions: true,
      json: true,
      maxsize: 5242880 * 2,
      colorize: false
    }),

    new winston.transports.Console({
      name: "silly",
      level: "silly",
      handleExceptions: true,
      json: false,
      colorize: true,
      timestamp: true
    })
  ]
});

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
