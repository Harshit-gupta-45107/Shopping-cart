const db = require('../config/db');

class Journal {
  static async create(title, description, teacherId, publishedAt, studentIds = [], attachments = []) {
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Create journal
      const journalResult = await client.query(
        'INSERT INTO journals (title, description, teacher_id, published_at) VALUES ($1, $2, $3, $4) RETURNING *',
        [title, description, teacherId, publishedAt]
      );
      const journal = journalResult.rows[0];      // Add student tags
      if (Array.isArray(studentIds) && studentIds.length > 0) {
        const values = studentIds.map((_, i) => `($1, $${i + 2})`).join(',');
        await client.query(
          `INSERT INTO journal_students (journal_id, student_id) VALUES ${values}`,
          [journal.id, ...studentIds]
        );
      }

      // Add attachments
      if (attachments.length > 0) {
        const attachmentValues = attachments.map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(',');
        const attachmentParams = attachments.reduce((acc, { type, url }) => [...acc, type, url], [journal.id]);
        await client.query(
          `INSERT INTO attachments (journal_id, type, url) VALUES ${attachmentValues}`,
          attachmentParams
        );
      }

      await client.query('COMMIT');
      return journal;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async update(journalId, teacherId, updates) {
    const { title, description, publishedAt, studentIds, attachments } = updates;
    const client = await db.connect();
    
    try {
      await client.query('BEGIN');
      
      // Update journal
      const journalResult = await client.query(
        'UPDATE journals SET title = $1, description = $2, published_at = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND teacher_id = $5 RETURNING *',
        [title, description, publishedAt, journalId, teacherId]
      );

      if (journalResult.rows.length === 0) {
        throw new Error('Journal not found or unauthorized');
      }

      // Update student tags
      if (studentIds) {
        await client.query('DELETE FROM journal_students WHERE journal_id = $1', [journalId]);
        if (studentIds.length > 0) {
          const values = studentIds.map((_, i) => `($1, $${i + 2})`).join(',');
          await client.query(
            `INSERT INTO journal_students (journal_id, student_id) VALUES ${values}`,
            [journalId, ...studentIds]
          );
        }
      }

      // Update attachments
      if (attachments) {
        await client.query('DELETE FROM attachments WHERE journal_id = $1', [journalId]);
        if (attachments.length > 0) {
          const attachmentValues = attachments.map((_, i) => `($1, $${i * 2 + 2}, $${i * 2 + 3})`).join(',');
          const attachmentParams = attachments.reduce((acc, { type, url }) => [...acc, type, url], [journalId]);
          await client.query(
            `INSERT INTO attachments (journal_id, type, url) VALUES ${attachmentValues}`,
            attachmentParams
          );
        }
      }

      await client.query('COMMIT');
      return journalResult.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async delete(journalId, teacherId) {
    const result = await db.query(
      'DELETE FROM journals WHERE id = $1 AND teacher_id = $2 RETURNING *',
      [journalId, teacherId]
    );
    return result.rows[0];
  }

  static async getTeacherFeed(teacherId) {
    const result = await db.query(
      `SELECT j.*, 
        json_agg(DISTINCT js.student_id) as tagged_students,
        json_agg(DISTINCT jsonb_build_object('type', a.type, 'url', a.url)) as attachments
      FROM journals j
      LEFT JOIN journal_students js ON j.id = js.journal_id
      LEFT JOIN attachments a ON j.id = a.journal_id
      WHERE j.teacher_id = $1
      GROUP BY j.id
      ORDER BY j.published_at DESC`,
      [teacherId]
    );
    return result.rows;
  }
  static async getStudentFeed(studentId) {
    const result = await db.query(
      `SELECT j.*, 
        COALESCE(json_agg(DISTINCT js.student_id) FILTER (WHERE js.student_id IS NOT NULL), '[]') as tagged_students,
        COALESCE(json_agg(DISTINCT jsonb_build_object('type', a.type, 'url', a.url)) FILTER (WHERE a.type IS NOT NULL), '[]') as attachments
      FROM journals j
      INNER JOIN journal_students js ON j.id = js.journal_id
      LEFT JOIN attachments a ON j.id = a.journal_id
      WHERE js.student_id = $1 
        AND j.published_at <= CURRENT_TIMESTAMP
        AND j.published_at >= CURRENT_TIMESTAMP - INTERVAL '1 year'
      GROUP BY j.id
      ORDER BY j.published_at DESC`,
      [studentId]
    );
    console.log('Student feed query result:', result.rows);
    return result.rows;
  }
}

module.exports = Journal;