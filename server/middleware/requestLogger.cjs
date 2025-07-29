const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class RequestLogger {
  constructor(options = {}) {
    this.config = {
      logDirectory: options.logDirectory || path.join(__dirname, '../logs'),
      logFileName: options.logFileName || 'requests.log',
      format: options.format || 'json', // 'json' or 'text'
      includeBody: options.includeBody || false,
      includeHeaders: options.includeHeaders || false,
      maxFileSize: options.maxFileSize || 10 * 1024 * 1024, // 10MB
      ...options
    };
    
    this.logFilePath = path.join(this.config.logDirectory, this.config.logFileName);
    this.initializeLogDirectory();
  }

  async initializeLogDirectory() {
    try {
      await fs.ensureDir(this.config.logDirectory);
      console.log(`📝 Request logging initialized: ${this.logFilePath}`);
    } catch (error) {
      console.error('❌ Failed to initialize log directory:', error.message);
    }
  }

  formatLogEntry(req, res, responseTime, error = null) {
    const timestamp = new Date().toISOString();
    const requestId = uuidv4();
    
    const baseEntry = {
      id: requestId,
      timestamp,
      method: req.method,
      url: req.originalUrl || req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent') || 'Unknown',
      ip: req.ip || req.connection.remoteAddress || 'Unknown'
    };

    if (this.config.includeHeaders) {
      baseEntry.headers = req.headers;
    }

    if (this.config.includeBody && req.body && Object.keys(req.body).length > 0) {
      baseEntry.body = req.body;
    }

    if (error) {
      baseEntry.error = {
        message: error.message,
        stack: error.stack
      };
    }

    if (this.config.format === 'text') {
      return `[${timestamp}] ${req.method} ${req.originalUrl || req.url} - ${res.statusCode} - ${responseTime}ms - ${req.ip || 'Unknown IP'}\n`;
    }

    return JSON.stringify(baseEntry) + '\n';
  }

  async rotateLogFile() {
    try {
      const stats = await fs.stat(this.logFilePath);
      if (stats.size > this.config.maxFileSize) {
        const timestamp = new Date().toISOString().split('T')[0];
        const rotatedFileName = `requests-${timestamp}-${Date.now()}.log`;
        const rotatedPath = path.join(this.config.logDirectory, rotatedFileName);
        
        await fs.move(this.logFilePath, rotatedPath);
        console.log(`🔄 Log file rotated: ${rotatedFileName}`);
      }
    } catch (error) {
      // File doesn't exist yet, which is fine
    }
  }

  async writeLog(logEntry) {
    try {
      await this.rotateLogFile();
      await fs.appendFile(this.logFilePath, logEntry);
    } catch (error) {
      console.error('❌ Failed to write log entry:', error.message);
      // Gracefully handle logging errors without crashing the application
    }
  }

  middleware() {
    return async (req, res, next) => {
      const startTime = Date.now();
      
      // Store original res.end to capture response
      const originalEnd = res.end;
      
      res.end = function(chunk, encoding) {
        const responseTime = Date.now() - startTime;
        
        // Create log entry
        const logEntry = this.formatLogEntry(req, res, responseTime);
        
        // Write log asynchronously to avoid blocking
        setImmediate(() => {
          this.writeLog(logEntry);
        });
        
        // Call original end method
        originalEnd.call(res, chunk, encoding);
      }.bind(this);

      // Handle errors
      const originalNext = next;
      next = (error) => {
        if (error) {
          const responseTime = Date.now() - startTime;
          const logEntry = this.formatLogEntry(req, res, responseTime, error);
          
          setImmediate(() => {
            this.writeLog(logEntry);
          });
        }
        originalNext(error);
      };

      next();
    };
  }

  async getRecentLogs(limit = 50) {
    try {
      const content = await fs.readFile(this.logFilePath, 'utf8');
      const lines = content.trim().split('\n').filter(line => line.trim());
      
      if (this.config.format === 'json') {
        return lines
          .slice(-limit)
          .map(line => {
            try {
              return JSON.parse(line);
            } catch {
              return null;
            }
          })
          .filter(Boolean)
          .reverse(); // Most recent first
      }
      
      return lines.slice(-limit).reverse();
    } catch (error) {
      console.error('❌ Failed to read log file:', error.message);
      return [];
    }
  }
}

module.exports = RequestLogger;