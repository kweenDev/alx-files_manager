// controllers/FilesController.js
/**
 * FilesController - Handles file-related operations.
 * Author: Refiloe Radebe
 * Date: 2025-01-27
 */

import { ObjectId } from 'mongodb';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class FilesController {
  /**
   * Retrieves file information by its ID.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  static async getShow(req, res) {
    try {
      const token = req.header('X-Token');
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Not found' });
      }

      const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(userId),
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      return res.status(200).json({
        id: file._id.toString(),
        userId: file.userId.toString(),
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      });
    } catch (error) {
      console.error('Error in getShow:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
   * Lists files based on parentId and pagination.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  static async getIndex(req, res) {
    try {
      const token = req.header('X-Token');
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { parentId = '0', page = 0 } = req.query;
      const filesPerPage = 20;

      const filter = { userId: new ObjectId(userId) };
      if (parentId !== '0') {
        if (!ObjectId.isValid(parentId)) {
          return res.status(200).json([]); // Invalid parentId, return empty array
        }
        filter.parentId = parentId;
      }

      const files = await dbClient.db
        .collection('files')
        .find(filter)
        .skip(parseInt(page, 10) * filesPerPage)
        .limit(filesPerPage)
        .toArray();

      const result = files.map((file) => ({
        id: file._id.toString(),
        userId: file.userId.toString(),
        name: file.name,
        type: file.type,
        isPublic: file.isPublic,
        parentId: file.parentId,
      }));

      return res.status(200).json(result);
    } catch (error) {
      console.error('Error in getIndex:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
 * Marks a file as public.
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 */
  static async publish(req, res) {
    try {
      const token = req.header('X-Token');
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Not found' });
      }

      const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(userId),
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      await dbClient.db.collection('files').updateOne(
        { _id: new ObjectId(id) },
        { $set: { isPublic: true } },
      );

      return res.status(200).json({
        id: file._id.toString(),
        userId: file.userId.toString(),
        name: file.name,
        type: file.type,
        isPublic: true,
        parentId: file.parentId,
      });
    } catch (error) {
      console.error('Error in publish:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  /**
 * Marks a file as private.
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 */
  static async unpublish(req, res) {
    try {
      const token = req.header('X-Token');
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params;
      if (!ObjectId.isValid(id)) {
        return res.status(404).json({ error: 'Not found' });
      }

      const file = await dbClient.db.collection('files').findOne({
        _id: new ObjectId(id),
        userId: new ObjectId(userId),
      });

      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }

      await dbClient.db.collection('files').updateOne(
        { _id: new ObjectId(id) },
        { $set: { isPublic: false } },
      );

      return res.status(200).json({
        id: file._id.toString(),
        userId: file.userId.toString(),
        name: file.name,
        type: file.type,
        isPublic: false,
        parentId: file.parentId,
      });
    } catch (error) {
      console.error('Error in unpublish:', error.message);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default FilesController;
