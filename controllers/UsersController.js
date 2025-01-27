// controllers/UsersController.js
/**
 * UsersController - Handles user-related operations.
 * Author: Refiloe Radebe
 * Date: 2025-01-24
 */

import { ObjectId } from 'mongodb';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  /**
   * Creates a new user in the database.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const usersCollection = dbClient.db.collection('users');
    const existingUser = await usersCollection.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);
    const result = await usersCollection.insertOne({ email, password: hashedPassword });

    const newUser = {
      id: result.insertedId,
      email,
    };

    return res.status(201).json(newUser);
  }

  /**
 * Retrieves the authenticated user's details.
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 */
  static async getMe(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ id: user._id.toString(), email: user.email });
  }
}

export default UsersController;
