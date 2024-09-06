import mongodb from 'mongodb';
// eslint-disable-next-line no-unused-vars
import Collection from 'mongodb/lib/collection';
import envLoader from './env_loader';

/**
 * Handles the connection to a MongoDB instance.
 */
class DBClient {
  /**
   * Initializes a new instance of DBClient and connects to MongoDB.
   */
  constructor() {
    envLoader();
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const dbURL = `mongodb://${host}:${port}/${database}`;

    this.client = new mongodb.MongoClient(dbURL, { useUnifiedTopology: true });
    this.client.connect();
  }

  /**
   * Confirms whether the client is connected to MongoDB.
   * @returns {boolean} True if connected, otherwise false.
   */
  isAlive() {
    return this.client.isConnected();
  }

  /**
   * Gets the count of user documents in the 'users' collection.
   * @returns {Promise<number>} The number of user documents.
   */
  async nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  /**
   * Gets the count of file documents in the 'files' collection.
   * @returns {Promise<number>} The number of file documents.
   */
  async nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }

  /**
   * Provides access to the 'users' collection in the database.
   * @returns {Promise<Collection>} The MongoDB 'users' collection.
   */
  async usersCollection() {
    return this.client.db().collection('users');
  }

  /**
   * Provides access to the 'files' collection in the database.
   * @returns {Promise<Collection>} The MongoDB 'files' collection.
   */
  async filesCollection() {
    return this.client.db().collection('files');
  }
}

export const dbClient = new DBClient();
export default dbClient;
