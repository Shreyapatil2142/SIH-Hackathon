const db = require('../models/db');

async function createDemoDocument() {
  try {
    console.log('📄 Creating demo document...');

    // Get the first user (admin)
    const users = await db.query('SELECT id FROM users LIMIT 1');
    if (users.length === 0) {
      console.log('❌ No users found. Please run init-db.js first.');
      return;
    }

    const userId = users[0].id;

    // Create a demo document
    const documentResult = await db.query(
      'INSERT INTO documents (title, text, created_by) VALUES (?, ?, ?)',
      [
        'MetroDocs System Overview',
        'This is a comprehensive document management system built with Node.js, Express, MySQL, and React. It features advanced document processing, AI-powered summarization, task management, and user collaboration tools. The system supports multiple file formats, real-time search, categorization, and export functionality.',
        userId
      ]
    );

    const documentId = documentResult.insertId;
    console.log(`✅ Created document with ID: ${documentId}`);

    // Get some categories and tags
    const categories = await db.query('SELECT id FROM document_categories LIMIT 2');
    const tags = await db.query('SELECT id FROM document_tags LIMIT 3');

    // Assign categories
    if (categories.length > 0) {
      await db.query(
        'INSERT INTO document_category_relations (document_id, category_id) VALUES (?, ?)',
        [documentId, categories[0].id]
      );
      console.log(`✅ Assigned category: ${categories[0].id}`);
    }

    // Assign tags
    for (const tag of tags) {
      await db.query(
        'INSERT INTO document_tag_relations (document_id, tag_id) VALUES (?, ?)',
        [documentId, tag.id]
      );
    }
    console.log(`✅ Assigned ${tags.length} tags`);

    console.log('🎉 Demo document created successfully!');
    console.log('📝 You can now see this document in the Enhanced Docs section with categories and tags.');

  } catch (error) {
    console.error('❌ Error creating demo document:', error);
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  createDemoDocument();
}

module.exports = createDemoDocument;
