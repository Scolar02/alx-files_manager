import { promisify } from 'util';
import { createClient } from 'redis';

/**
 * Defines a client interface for interacting with Redis.
 */
class RedisClient {
  /**
   * Initializes a new instance of RedisClient.
   */
  constructor() {
    this.client = createClient();
    this.isClientConnected = true;
    this.client.on('error', (err) => {
      console.error('Error connecting to Redis:', err.message || err.toString());
      this.isClientConnected = false;
    });
    this.client.on('connect', () => {
      this.isClientConnected = true;
    });
  }

  /**
   * Verifies if the client is successfully connected to the Redis server.
   * @returns {boolean}
   */
  isAlive() {
    return this.isClientConnected;
  }

  /**
   * Retrieves the value associated with the specified key from Redis.
   * @param {String} key The key to look up in Redis.
   * @returns {String | Object}
   */
  async get(key) {
    return promisify(this.client.GET).bind(this.client)(key);
  }

  /**
   * Stores a key-value pair in Redis with an expiration time.
   * @param {String} key The key to store in Redis.
   * @param {String | Number | Boolean} value The value to associate with the key.
   * @param {Number} duration Time (in seconds) before the key-value pair expires.
   * @returns {Promise<void>}
   */
  async set(key, value, duration) {
    await promisify(this.client.SETEX).bind(this.client)(key, duration, value);
  }

  /**
   * Deletes the specified key and its associated value from Redis.
   * @param {String} key The key to remove from Redis.
   * @returns {Promise<void>}
   */
  async del(key) {
    await promisify(this.client.DEL).bind(this.client)(key);
  }
}

export const redisClient = new RedisClient();
export default redisClient;
