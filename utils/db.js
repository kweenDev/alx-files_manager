// utils/db.js
/**
 * DBClient - Utility class for interacting with a MongoDB database.
 * Author: Refiloe Radebe
 * Date: 2025-01-24
 */

import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.dbName = database;

    this.client.connect().then(() => {
      this.db = this.client.db(this.dbName);
      console.log('Connected to MongoDB');
    }).catch((err) => console.error('MongoDB Connection Error:', err));
  }

  /**
   * Checks if MongoDB is alive.
   * @returns {boolean} True if connected, false otherwise.
   */
  isAlive() {
    return this.client.isConnected();
  }

  /**
   * Returns the number of documents in the users collection.
   * @returns {Promise<number>} The number of users.
   */
  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }

  /**
   * Returns the number of documents in the files collection.
   * @returns {Promise<number>} The number of files.
   */
  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
