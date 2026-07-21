import { query } from '../config/database.js';

async function addSocialColumns() {
  const columns = [
    'instagram VARCHAR(255)',
    'youtube VARCHAR(255)',
    'twitter VARCHAR(255)',
    'bio TEXT' // for modify
  ];

  console.log('Adding social columns...');

  for (const colDef of columns) {
    const colName = colDef.split(' ')[0];
    try {
      if (colName === 'bio') {
         await query(`ALTER TABLE influencer_profiles MODIFY COLUMN ${colDef}`);
         console.log(`Modified ${colName}`);
      } else {
         // Try finding if it exists first to avoid error spam
         const check = await query(`SHOW COLUMNS FROM influencer_profiles LIKE '${colName}'`);
         if (check.length === 0) {
            await query(`ALTER TABLE influencer_profiles ADD COLUMN ${colDef}`);
            console.log(`Added ${colName}`);
         } else {
            console.log(`Skipped ${colName} (exists)`);
         }
      }
    } catch (err) {
      console.error(`Error processing ${colName}:`, err.message);
    }
  }
  
  process.exit(0);
}

addSocialColumns();
