const mongoose = require('mongoose');
require('dotenv').config({ path: '../database/.env' });

/**
 * MongoDB Connection Configuration
 * Handles connection to MongoDB using Mongoose
 */
class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ui-fixer';
    this.options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: parseInt(process.env.MONGODB_MAX_POOL_SIZE) || 10,
      serverSelectionTimeoutMS: parseInt(process.env.MONGODB_SERVER_SELECTION_TIMEOUT_MS) || 5000,
      socketTimeoutMS: parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS) || 45000,
      bufferMaxEntries: 0,
      bufferCommands: false,
    };
  }

  /**
   * Connect to MongoDB
   * @returns {Promise} Connection promise
   */
  async connect() {
    try {
      if (this.connection) {
        console.log('✅ Database already connected');
        return this.connection;
      }

      console.log('🔄 Connecting to MongoDB...');
      console.log(`📍 URI: ${this.uri}`);

      this.connection = await mongoose.connect(this.uri, this.options);

      console.log('✅ MongoDB connected successfully!');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log(`🖥️  Host: ${mongoose.connection.host}`);

      // Listen for connection events
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('⚠️  MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });

      return this.connection;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   * @returns {Promise} Disconnection promise
   */
  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
        console.log('✅ MongoDB disconnected successfully');
      }
    } catch (error) {
      console.error('❌ Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get connection status
   * @returns {Object} Connection status information
   */
  getConnectionStatus() {
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      state: states[mongoose.connection.readyState],
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      readyState: mongoose.connection.readyState
    };
  }

  /**
   * Health check for database connection
   * @returns {Promise<Object>} Health status
   */
  async healthCheck() {
    try {
      const status = this.getConnectionStatus();
      
      if (status.state === 'connected') {
        // Test connection with a ping
        await mongoose.connection.db.admin().ping();
        return {
          status: 'healthy',
          ...status,
          timestamp: new Date().toISOString(),
          message: 'Database connection is working properly'
        };
      } else {
        return {
          status: 'unhealthy',
          ...status,
          timestamp: new Date().toISOString(),
          message: 'Database is not connected'
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
        message: 'Database health check failed'
      };
    }
  }
}

// Create and export singleton instance
const dbConnection = new DatabaseConnection();

module.exports = dbConnection;
