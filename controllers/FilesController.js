import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';

const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    const { name, type, parentId = 0, isPublic = false, data } = req.body;

    if (!name) return res.status(400).json({ error: 'Missing name' });
    if (!type) return res.status(400).json({ error: 'Missing type' });
    if (['folder', 'file', 'image'].indexOf(type) === -1) return res.status(400).json({ error: 'Invalid type' });
    if (type !== 'folder' && !data) return res.status(400).json({ error: 'Missing data' });

    try {
      const userId = await dbClient.redisClient.get(`auth_${token}`);
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      if (parentId !== 0) {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: new MongoClient.ObjectId(parentId) });
        if (!parentFile) return res.status(400).json({ error: 'Parent not found' });
        if (parentFile.type !== 'folder') return res.status(400).json({ error: 'Parent is not a folder' });
      }

      let localPath = '';
      if (type !== 'folder') {
        localPath = path.join(FOLDER_PATH, `${uuidv4()}`);
        fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
      }

      const result = await dbClient.db.collection('files').insertOne({
        userId,
        name,
        type,
        parentId,
        isPublic,
        localPath: localPath || undefined
      });

      res.status(201).json({
        id: result.insertedId,
        userId,
        name,
        type,
        isPublic,
        parentId,
        localPath
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default FilesController;
