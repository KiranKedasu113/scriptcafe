const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const host = 'localhost';
const user = 'postgres';
const database = 'postgres';
const password = 'postgres';
const port = 5432;

console.log('--- ISHA CAFE LOCAL DATABASE MIGRATION TOOL ---');
console.log(`Target Host: ${host}`);
console.log(`Database: ${database}`);
console.log(`User: ${user}`);
console.log('');

const connectionString = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}`;
const client = new Client({ connectionString });

client.connect()
  .then(async () => {
    console.log('Connected successfully to local database!');
    
    // Bootstrap Supabase roles and schemas locally
    console.log('Bootstrapping default Supabase roles and auth schema locally...');
    await client.query(`
      -- Create default roles
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'anon') THEN
          CREATE ROLE anon;
        END IF;
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'authenticated') THEN
          CREATE ROLE authenticated;
        END IF;
      END
      $$;

      -- Create mock auth schema and users table
      CREATE SCHEMA IF NOT EXISTS auth;
      
      CREATE TABLE IF NOT EXISTS auth.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE
      );

      -- Create mock auth.uid() function
      CREATE OR REPLACE FUNCTION auth.uid()
      RETURNS UUID
      LANGUAGE sql
      STABLE
      AS $$
        SELECT '00000000-0000-0000-0000-000000000000'::UUID;
      $$;
    `);
    console.log('✓ Roles and auth schema bootstrapped.\n');
    
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

    console.log('\nAll migrations executed successfully on localhost! 🎉');
    await client.end();
    process.exit(0);
  })
  .catch((err) => {
    console.error('\nFailed to connect to local database:');
    console.error(err.message);
    process.exit(1);
  });
