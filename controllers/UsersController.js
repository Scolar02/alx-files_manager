import { createHash } from 'crypto';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ error: 'Missing email' });
    if (!password) return res.status(400).json({ error: 'Missing password' });

    const hashedPassword = createHash('sha1').update(password).digest('hex');

    try {
      const existingUser = await dbClient.db.collection('users').findOne({ email });

      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const result = await dbClient.db.collection('users').insertOne({
        email,
        password: hashedPassword
      });

      res.status(201).json({ id: result.insertedId, email });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const userId = await dbClient.redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const user = await dbClient.db.collection('users').findOne({ _id: new MongoClient.ObjectId(userId) });
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      res.status(200).json({ id: user._id, email: user.email });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default UsersController;
