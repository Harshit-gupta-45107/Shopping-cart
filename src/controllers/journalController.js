// const { validationResult } = require('express-validator');
// const Journal = require('../models/journal');
// const userModel = require('../models/user');
// const Notification = require('../models/notification');
// const path = require('path');
import { validationResult } from 'express-validator';
import Journal from '../models/journal.js';
import userModel from '../models/user.js';
import Notification from '../models/notification.js';
import path from 'path';

// Helper function to convert to IST
const convertToIST = (date) => {
  return new Date(date.getTime() + (5.5 * 60 * 60 * 1000)); // Adding 5:30 hours for IST
};

const createJournal = async (req, res) => {
  try {    const { title, description, publishedAt, attachmentType, attachmentUrl } = req.body;
    
    // Validate required fields
    if (!title || !description || !publishedAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate published_at date using IST
    const publishDate = convertToIST(new Date(publishedAt));
    const currentDate = convertToIST(new Date());
    if (publishDate < currentDate) {
      return res.status(400).json({ 
        error: 'Published date cannot be earlier than the current date (IST)' 
      });
    }

    // Parse and validate studentIds
    let studentIds;
    try {
      studentIds = JSON.parse(req.body.studentIds || '[]');
      if (!Array.isArray(studentIds)) {
        return res.status(400).json({ error: 'studentIds must be an array' });
      }

      // Verify that all IDs belong to actual students
      for (const studentId of studentIds) {
        const student = await userModel.findById(studentId);
        if (!student || student.role !== 'student') {
          return res.status(400).json({ 
            error: `Invalid student ID: ${studentId}. User does not exist or is not a student.` 
          });
        }
      }
    } catch (e) {
      return res.status(400).json({ error: 'Invalid studentIds format' });
    }
    
    const teacherId = req.user.id;
    const attachments = [];

    // Handle file attachments
    if (req.files && req.files.length > 0) {
      if (!attachmentType) {
        return res.status(400).json({ error: 'attachmentType is required when uploading files' });
      }
      attachments.push(...req.files.map(file => ({
        type: attachmentType,
        url: `uploads/${file.filename}`
      })));
    }

    // Handle URL attachment
    if (attachmentUrl && (!attachmentType || attachmentType === 'url')) {
      try {
        new URL(attachmentUrl); // Validate URL format
        attachments.push({
          type: 'url',
          url: attachmentUrl
        });
      } catch (e) {
        return res.status(400).json({ error: 'Invalid URL format' });
      }
    }    const journal = await Journal.create(
      title,
      description,
      teacherId,
      publishedAt,
      studentIds,
      attachments
    );

    // Create notifications for tagged students
    try {
      for (const studentId of studentIds) {
        await Notification.create(
          studentId,
          'journal_tag',
          'New Journal Tag',
          `You have been tagged in a new journal: ${title}`,
          journal.id
        );
      }
    } catch (notifyError) {
      console.error('Error creating notifications:', notifyError);
      // Continue even if notification creation fails
    }

    res.status(201).json(journal);} catch (error) {
    console.error('Create journal error:', error);
    console.error('Request body:', req.body);
    console.error('User:', req.user);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
};

const updateJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;
    
    // Parse and validate required fields
    if (!req.body.title || !req.body.description || !req.body.publishedAt) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create updates object
    const updates = {
      title: req.body.title,
      description: req.body.description,
      publishedAt: convertToIST(new Date(req.body.publishedAt)).toISOString(),
    };

    // Parse and validate studentIds if provided
    if (req.body.studentIds) {
      try {
        updates.studentIds = JSON.parse(req.body.studentIds);
        if (!Array.isArray(updates.studentIds)) {
          return res.status(400).json({ error: 'studentIds must be an array' });
        }
      } catch (e) {
        return res.status(400).json({ error: 'Invalid studentIds format' });
      }
    }

    // Handle attachments
    if (req.files || req.body.attachmentUrl) {
      updates.attachments = [];
      if (req.files) {
        updates.attachments.push(...req.files.map(file => ({
          type: req.body.attachmentType,
          url: `uploads/${file.filename}`
        })));
      }
      if (req.body.attachmentUrl) {
        updates.attachments.push({
          type: 'url',
          url: req.body.attachmentUrl
        });
      }
    }

    const journal = await Journal.update(id, teacherId, updates);
    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' });
    }

    res.json(journal);
  } catch (error) {
    console.error('Update journal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteJournal = async (req, res) => {
  try {
    const { id } = req.params;
    const teacherId = req.user.id;

    const journal = await Journal.delete(id, teacherId);
    if (!journal) {
      return res.status(404).json({ error: 'Journal not found' });
    }

    res.json({ message: 'Journal deleted successfully' });
  } catch (error) {
    console.error('Delete journal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getJournalFeed = async (req, res) => {  try {
    const { id, role } = req.user;
    console.log('User requesting feed:', { id, role });
    let journals;

    if (role === 'teacher') {
      journals = await Journal.getTeacherFeed(id);
    } else {
      console.log('Fetching student feed for student ID:', id);
      journals = await Journal.getStudentFeed(id);
    }

    res.json(journals);
  } catch (error) {
    console.error('Get journal feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// module.exports = {
//   createJournal,
//   updateJournal,
//   deleteJournal,
//   getJournalFeed
// };
export { createJournal, updateJournal, deleteJournal, getJournalFeed };
