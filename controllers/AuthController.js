// controllers/AuthController.js
/**
 * AuthController - Handles user authentication.
 * Author: Refiloe Radebe
 * Date: 2025-01-27
 */

import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  /**
 * Signs in a user and generates an authentication token.
 * Handles invalid Base64 content, unknown email, and wrong password.
 * @param {Request} req - The HTTP request object.
 * @param {Response} res - The HTTP response object.
 */
  static async getConnect(req, res) {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
    // Decode Base64 credentials
      const base64Credentials = authHeader.split(' ')[1];
      const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');

      // Extract email and password
      const [email, password] = decodedCredentials.split(':');
      if (!email || !password) {
        throw new Error('Invalid credentials format');
      }

      // Hash the password and find the user in the database
      const hashedPassword = sha1(password);
      const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate token and store it in Redis
      const token = uuidv4();
      await redisClient.set(`auth_${token}`, user._id.toString(), 24 * 3600);

      return res.status(200).json({ token });
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  /**
   * Signs out a user by invalidating their token.
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   */
  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(`auth_${token}`);
    return res.status(204).send();
  }
}

export default AuthController;
