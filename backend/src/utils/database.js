const mongoose = require('mongoose');

/**
 * Database connection utility
 */
class Database {
  constructor() {
    this.connection = null;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      if (this.connection) {
        console.log('Database already connected');
        return this.connection;
      }

      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ui-fixer';
      const options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        bufferMaxEntries: 0, // Disable mongoose buffering
        bufferCommands: false, // Disable mongoose buffering
      };

      console.log('Connecting to MongoDB...');
      this.connection = await mongoose.connect(mongoUri, options);
      
      console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
      console.log(`📊 Database: ${mongoose.connection.name}`);
      
      return this.connection;
    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
        console.log('MongoDB disconnected');
      }
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get connection status
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
      name: mongoose.connection.name
    };
  }

  /**
   * Health check for database
   */
  async healthCheck() {
    try {
      const status = this.getConnectionStatus();
      if (status.state === 'connected') {
        // Test with a simple ping
        await mongoose.connection.db.admin().ping();
        return {
          status: 'healthy',
          ...status,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          status: 'unhealthy',
          ...status,
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new Database();
