const { createClient } = require('@supabase/supabase-js');

const url = 'https://qftftnrqtyhvnwdhstrz.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmdGZ0bnJxdHlodm53ZGhzdHJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcyOTYzMTcsImV4cCI6MjEwMjg3MjMxN30.MpzpPVgmrbB8JmEI1jat216HJh9XXT426RNxialyoc4';

const supabase = createClient(url, anonKey);

async function setupAccounts() {
  console.log('--- CREATING ADMIN & CASHIER ACCOUNTS IN SUPABASE ---');

  const accounts = [
    { email: 'admin@ishacafe.com', password: 'Admin@123', role: 'ADMIN', name: 'Cafe Admin' },
    { email: 'cashier@ishacafe.com', password: 'Cashier@123', role: 'CASHIER', name: 'Cashier Station' }
  ];

  for (const acc of accounts) {
    console.log(`Creating user ${acc.email}...`);
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: acc.email,
      password: acc.password,
    });

    if (signUpErr) {
      console.log(`⚠️ Note for ${acc.email}: ${signUpErr.message}`);
    } else {
      console.log(`✓ User created! ID: ${signUpData.user?.id}`);
    }

    // Now test logging in
    const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
      email: acc.email,
      password: acc.password,
    });

    if (loginErr) {
      console.log(`❌ Login check failed for ${acc.email}: ${loginErr.message}`);
    } else {
      console.log(`🎉 SUCCESS! Verified login working for ${acc.email}`);
    }
  }
}

setupAccounts();
