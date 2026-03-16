// Stub for pino logger — Hermes cannot run pino@10's class syntax.
// WalletConnect uses pino for debug logging only; relay functionality is unaffected.
module.exports = function pino() {
    const noop = () => {};
    const logger = {
        info: noop, warn: noop, error: noop, debug: noop, trace: noop, fatal: noop,
        child: () => logger, level: 'silent', isLevelEnabled: () => false,
    };
    return logger;
};
module.exports.default = module.exports;
module.exports.pino = module.exports;
