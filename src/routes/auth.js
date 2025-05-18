import express from 'express';
import { body } from 'express-validator';
import authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/auth.js';


const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [teacher, student]
 *                 default: student
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Username already exists
 *       500:
 *         description: Server error
 */
router.post(
  '/register',
  [
    body('username').isString().trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
    body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['teacher', 'student']).withMessage('Role must be either teacher or student')
  ],
  authController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with username and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Server error
 */
router.post(
  '/login',
  [
    body('username').isString().trim().notEmpty().withMessage('Username is required'),
    body('password').isString().notEmpty().withMessage('Password is required')
  ],
  authController.login
);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/profile', authenticate, authController.getProfile);

//module.exports = router;
export default router;
