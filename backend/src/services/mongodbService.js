const { MongoClient } = require('mongodb');

/**
 * MongoDB Service for UI-Fixer
 * Handles connection to MongoDB Atlas and provides database operations
 */
class MongoDBService {
  constructor() {
    this.uri = process.env.MONGODB_URI;
    this.dbName = process.env.MONGODB_DB_NAME || 'ui-fixer';
    this.client = null;
    this.db = null;
  }

  /**
   * Connect to MongoDB Atlas
   */
  async connect() {
    if (this.client && this.client.isConnected()) {
      return this.db;
    }

    try {
      if (!this.uri) {
        throw new Error('MONGODB_URI not found in environment variables');
      }

      if (this.uri.includes('your_username') || this.uri.includes('your_password')) {
        console.warn('⚠️  MongoDB Atlas URI contains placeholder values. Please update with your actual credentials.');
        return null;
      }

      this.client = new MongoClient(this.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      this.db = this.client.db(this.dbName);
      
      console.log('✅ Connected to MongoDB Atlas successfully');
      
      // Create indexes for better performance
      await this.createIndexes();
      
      return this.db;
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB Atlas:', error.message);
      console.log('💡 To connect to MongoDB Atlas:');
      console.log('   1. Go to https://cloud.mongodb.com');
      console.log('   2. Create a free cluster');
      console.log('   3. Get your connection string');
      console.log('   4. Replace the placeholder in your .env file');
      
      this.client = null;
      this.db = null;
      return null;
    }
  }

  /**
   * Create necessary indexes for collections
   */
  async createIndexes() {
    try {
      // Analysis results collection indexes
      await this.db.collection('analysis_results').createIndex({ imageId: 1 });
      await this.db.collection('analysis_results').createIndex({ analyzedAt: -1 });
      await this.db.collection('analysis_results').createIndex({ 'metadata.filename': 1 });
      
      // Images collection indexes
      await this.db.collection('images').createIndex({ uploadDate: -1 });
      await this.db.collection('images').createIndex({ originalName: 1 });
      
      console.log('✅ Database indexes created successfully');
    } catch (error) {
      console.warn('⚠️  Failed to create indexes:', error.message);
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
      console.log('🔌 Disconnected from MongoDB Atlas');
    }
  }

  /**
   * Save analysis result to database
   */
  async saveAnalysisResult(analysisResult) {
    try {
      if (!this.db) {
        await this.connect();
      }
      
      if (!this.db) {
        console.warn('⚠️  MongoDB not connected, skipping save to database');
        return null;
      }

      const collection = this.db.collection('analysis_results');
      const result = await collection.insertOne({
        ...analysisResult,
        savedAt: new Date()
      });

      console.log(`✅ Analysis result saved with ID: ${result.insertedId}`);
      return result.insertedId;
    } catch (error) {
      console.error('❌ Failed to save analysis result:', error.message);
      return null;
    }
  }

  /**
   * Get analysis results by image ID
   */
  async getAnalysisResultsByImageId(imageId) {
    try {
      if (!this.db) {
        await this.connect();
      }
      
      if (!this.db) {
        return [];
      }

      const collection = this.db.collection('analysis_results');
      const results = await collection.find({ imageId }).sort({ analyzedAt: -1 }).toArray();
      
      return results;
    } catch (error) {
      console.error('❌ Failed to get analysis results:', error.message);
      return [];
    }
  }

  /**
   * Get recent analysis results
   */
  async getRecentAnalysisResults(limit = 10) {
    try {
      if (!this.db) {
        await this.connect();
      }
      
      if (!this.db) {
        return [];
      }

      const collection = this.db.collection('analysis_results');
      const results = await collection
        .find({})
        .sort({ analyzedAt: -1 })
        .limit(limit)
        .toArray();

      return results;
    } catch (error) {
      console.error('❌ Failed to get recent analysis results:', error.message);
      return [];
    }
  }

  /**
   * Get analysis statistics
   */
  async getAnalysisStats() {
    try {
      if (!this.db) {
        await this.connect();
      }
      
      if (!this.db) {
        return null;
      }

      const collection = this.db.collection('analysis_results');
      
      const totalAnalyses = await collection.countDocuments();
      const avgScore = await collection.aggregate([
        { $group: { _id: null, avgScore: { $avg: '$report.overallScore' } } }
      ]).toArray();
      
      const methodCounts = await collection.aggregate([
        { $group: { _id: '$metadata.analysisMethod', count: { $sum: 1 } } }
      ]).toArray();
      
      const recentAnalyses = await collection.countDocuments({
        analyzedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
      });

      return {
        totalAnalyses,
        averageScore: avgScore[0]?.avgScore || 0,
        methodCounts,
        recentAnalyses
      };
    } catch (error) {
      console.error('❌ Failed to get analysis stats:', error.message);
      return null;
    }
  }

  /**
   * Save image metadata
   */
  async saveImageMetadata(imageMetadata) {
    try {
      if (!this.db) {
        await this.connect();
      }
      
      if (!this.db) {
        console.warn('⚠️  MongoDB not connected, skipping save to database');
        return null;
      }

      const collection = this.db.collection('images');
      const result = await collection.insertOne({
        ...imageMetadata,
        uploadDate: new Date()
      });

      console.log(`✅ Image metadata saved with ID: ${result.insertedId}`);
      return result.insertedId;
    } catch (error) {
      console.error('❌ Failed to save image metadata:', error.message);
      return null;
    }
  }

  /**
   * Get image metadata by ID
   */
  async getImageMetadata(imageId) {
    try {
      if (!this.db) {
        await this.connect();
      }
      
      if (!this.db) {
        return null;
      }

      const collection = this.db.collection('images');
      const result = await collection.findOne({ id: imageId });
      
      return result;
    } catch (error) {
      console.error('❌ Failed to get image metadata:', error.message);
      return null;
    }
  }

  /**
   * Check if MongoDB is connected
   */
  isConnected() {
    return this.client && this.client.isConnected() && this.db;
  }
}

// Create singleton instance
const mongoDBService = new MongoDBService();

module.exports = mongoDBService;
