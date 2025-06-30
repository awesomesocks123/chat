// Simple script to run the migration
import { exec } from 'child_process';

console.log('Starting migration process...');
exec('node src/scripts/migrateToSessions.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log('Migration completed successfully!');
});
