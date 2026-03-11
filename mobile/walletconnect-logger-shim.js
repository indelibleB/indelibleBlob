const customLogger = {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
    trace: console.trace,
    fatal: console.error,
};

module.exports = {
    createLogger: function () {
        return customLogger;
    },
    default: customLogger
};
