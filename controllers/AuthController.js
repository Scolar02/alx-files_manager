import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const [email, password] = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const hashedPassword = createHash('sha1').update(password).digest('hex');

    try {
      const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      const token = uuidv4();
      await dbClient.redisClient.set(`auth_${token}`, user._id, 'EX', 86400); // 24 hours

      res.status(200).json({ token });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    try {
      const result = await dbClient.redisClient.del(`auth_${token}`);
      if (result === 0) return res.status(401).json({ error: 'Unauthorized' });

      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default AuthController;
