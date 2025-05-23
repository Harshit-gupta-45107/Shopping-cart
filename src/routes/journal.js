// const express = require('express');
// const { authenticate, authorizeTeacher } = require('../middlewares/auth');
// const upload = require('../middlewares/upload');
// const {
//   createJournal,
//   updateJournal,
//   deleteJournal,
//   getJournalFeed
// } = require('../controllers/journalController');
import express from 'express';
import { authenticate, authorizeTeacher } from '../middlewares/auth.js';
import upload from '../middlewares/upload.js';
import {
  createJournal,
  updateJournal,
  deleteJournal,
  getJournalFeed
} from '../controllers/journalController.js';

const router = express.Router();

// Protected routes
router.use(authenticate);

// Journal feed (available to both teachers and students)
router.get('/feed', getJournalFeed);

// Teacher-only routes
router.post('/', authorizeTeacher, upload.array('attachment'), createJournal);
router.put('/:id', authorizeTeacher, upload.array('attachment'), updateJournal);
router.delete('/:id', authorizeTeacher, deleteJournal);

//module.exports = router;
export default router;
