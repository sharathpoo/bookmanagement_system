const path = require('path');

const loggingConfig = {
  development: {
    logDirectory: path.join(__dirname, '../logs'),
    logFileName: 'requests-dev.log',
    format: 'json',
    includeBody: true,
    includeHeaders: false,
    maxFileSize: 5 * 1024 * 1024 // 5MB
  },
  production: {
    logDirectory: '/var/log/bookapp',
    logFileName: 'requests.log',
    format: 'json',
    includeBody: false,
    includeHeaders: false,
    maxFileSize: 50 * 1024 * 1024 // 50MB
  },
  test: {
    logDirectory: path.join(__dirname, '../logs/test'),
    logFileName: 'requests-test.log',
    format: 'text',
    includeBody: false,
    includeHeaders: false,
    maxFileSize: 1 * 1024 * 1024 // 1MB
  }
};

const getLoggingConfig = (environment = 'development') => {
  return loggingConfig[environment] || loggingConfig.development;
};

module.exports = {
  loggingConfig,
  getLoggingConfig
};