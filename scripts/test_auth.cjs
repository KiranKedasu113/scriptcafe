const { createClient } = require('@supabase/supabase-js');

const url = 'https://qftftnrqtyhvnwdhstrz.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdGZ0bnJxdHlodm53ZGhzdHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTYzMTcsImV4cCI6MjEwMjg3MjMxN30.MpzpPVgmrbB8JmEI1jat216HJh9XXT426RNxialyoc4';

const supabase = createClient(url, anonKey);

async function testLogins() {
  console.log('--- TESTING SUPABASE AUTH CREDENTIALS ---');

  const testAccounts = [
    { email: 'admin@ishacafe.com', pass: 'Admin@123' },
    { email: 'cashier@ishacafe.com', pass: 'Cashier@123' },
  ];

  for (const acc of testAccounts) {
    console.log(`Testing ${acc.email}...`);
    const { data, error } = await supabase.auth.signInWithPassword({ email: acc.email, password: acc.pass });
    if (error) {
      console.log(`❌ Failed for ${acc.email}: ${error.message}`);
    } else {
      console.log(`🎉 SUCCESS! Logged in as ${data.user.email} (ID: ${data.user.id})`);
    }
  }
}

testLogins();
