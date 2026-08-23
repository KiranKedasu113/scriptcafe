const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const host = 'db.qftftnrqtyhvnwdhstrz.supabase.co';
const user = 'postgres';
const database = 'postgres';
const port = 5432;

console.log('--- ISHA CAFE DATABASE MIGRATION TOOL ---');
console.log(`Target Host: ${host}`);
console.log(`Database: ${database}`);
console.log(`User: ${user}`);
console.log('');

rl.question('Enter database password: ', (password) => {
  if (!password) {
    console.error('Password is required.');
    process.exit(1);
  }

  const connectionString = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  client.connect()
    .then(async () => {
      console.log('\nConnected successfully to Supabase database!');
      
      const migrationsDir = path.join(__dirname, '../supabase/migrations');
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      console.log(`Found ${files.length} migration files to execute.\n`);

      for (const file of files) {
        console.log(`Executing ${file}...`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        try {
          await client.query(sql);
          console.log(`✓ ${file} executed successfully.`);
        } catch (err) {
          console.error(`✗ Error executing ${file}:`);
          console.error(err.message);
          console.log('\nAborting migrations due to error.');
          await client.end();
          process.exit(1);
        }
      }

      console.log('\nAll migrations executed successfully! 🎉');
      await client.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error('\nFailed to connect to database:');
      console.error(err.message);
      process.exit(1);
    });
});
