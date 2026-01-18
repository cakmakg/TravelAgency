#!/usr/bin/env node

/**
 * Password Hash Generator
 * 
 * Usage: npm run generate-password-hash "your-password"
 * 
 * This script generates a bcrypt hash of a password for use in the
 * ADMIN_PASSWORD environment variable.
 */

const bcrypt = require('bcryptjs');

const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('Usage: npm run generate-password-hash "your-password"');
    console.error('');
    console.error('Example: npm run generate-password-hash "MySecurePassword123!"');
    process.exit(1);
}

const password = args.join(' ');

const SALT_ROUNDS = 10;

bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
    if (err) {
        console.error('Error generating hash:', err);
        process.exit(1);
    }

    console.log('\n✅ Password hash generated successfully!\n');
    console.log('Add this to your .env file as ADMIN_PASSWORD:\n');
    console.log('ADMIN_PASSWORD=' + hash);
    console.log('\n⚠️  Keep this hash secure and never commit it to version control!\n');
});
