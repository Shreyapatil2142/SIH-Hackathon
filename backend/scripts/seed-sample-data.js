const db = require('../models/db');

async function seedSampleData() {
  try {
    console.log('🌱 Seeding sample data...');

    // Sample categories
    const categories = [
      { name: 'Legal Documents', description: 'Contracts, agreements, and legal paperwork', color: '#EF4444' },
      { name: 'Financial Reports', description: 'Budget reports, financial statements', color: '#10B981' },
      { name: 'Meeting Minutes', description: 'Notes from meetings and discussions', color: '#3B82F6' },
      { name: 'Project Documentation', description: 'Project plans, specifications, and updates', color: '#8B5CF6' },
      { name: 'HR Documents', description: 'Employee records, policies, and procedures', color: '#F59E0B' }
    ];

    console.log('📁 Creating sample categories...');
    for (const category of categories) {
      try {
        await db.query(
          'INSERT INTO document_categories (name, description, color) VALUES (?, ?, ?)',
          [category.name, category.description, category.color]
        );
        console.log(`✅ Created category: ${category.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Category already exists: ${category.name}`);
        } else {
          console.error(`❌ Error creating category ${category.name}:`, error.message);
        }
      }
    }

    // Sample tags
    const tags = [
      { name: 'urgent', color: '#DC2626' },
      { name: 'confidential', color: '#7C2D12' },
      { name: 'draft', color: '#6B7280' },
      { name: 'approved', color: '#059669' },
      { name: 'review', color: '#D97706' },
      { name: 'archived', color: '#4B5563' },
      { name: 'template', color: '#7C3AED' },
      { name: 'final', color: '#0D9488' }
    ];

    console.log('🏷️  Creating sample tags...');
    for (const tag of tags) {
      try {
        await db.query(
          'INSERT INTO document_tags (name, color) VALUES (?, ?)',
          [tag.name, tag.color]
        );
        console.log(`✅ Created tag: ${tag.name}`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`⚠️  Tag already exists: ${tag.name}`);
        } else {
          console.error(`❌ Error creating tag ${tag.name}:`, error.message);
        }
      }
    }

    console.log('🎉 Sample data seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`- ${categories.length} categories created`);
    console.log(`- ${tags.length} tags created`);
    console.log('\n🚀 You can now test the enhanced features!');

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  } finally {
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  seedSampleData();
}

module.exports = seedSampleData;
