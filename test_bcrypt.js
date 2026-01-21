const bcrypt = require('bcryptjs');

// Test credentials
const testEmail = 'admin@russoluxtours.de';
const testPassword = 'RussoLux2026!';
const storedHash = '$2b$10$tUUemSJgbfXhTFH.LgwXJup6UoxMAp6i36lKZGRiXcgaGuCkCNdf2';

console.log('=== LOGIN CREDENTIAL TEST ===\n');
console.log('Email:', testEmail);
console.log('Password:', testPassword);
console.log('Stored Hash:', storedHash);
console.log('\n--- Testing bcrypt.compare() ---');

// Test 1: Direct password comparison
bcrypt.compare(testPassword, storedHash)
    .then(result => {
        console.log('\n✓ Test 1 - Direct comparison: ', result ? 'PASS ✓' : 'FAIL ✗');
        if (!result) {
            console.log('  ERROR: Password does not match hash!');
        }
    })
    .catch(err => {
        console.log('\n✗ Test 1 - Error: ', err.message);
    })
    .then(() => {
        // Test 2: Test wrong password
        console.log('\n--- Testing wrong password ---');
        return bcrypt.compare('WrongPassword123', storedHash);
    })
    .then(result => {
        console.log('Wrong password comparison: ', result ? 'MATCHED (ERROR)' : 'NO MATCH (OK)');
    })
    .catch(err => {
        console.log('Error in wrong password test: ', err.message);
    })
    .then(() => {
        // Test 3: Generate new hash to verify the original password
        console.log('\n--- Generating new hash for verification ---');
        return bcrypt.hash(testPassword, 10);
    })
    .then(newHash => {
        console.log('New hash generated:', newHash);
        return bcrypt.compare(testPassword, newHash);
    })
    .then(result => {
        console.log('New hash verification: ', result ? 'PASS ✓' : 'FAIL ✗');
    })
    .catch(err => {
        console.log('Error in new hash test: ', err.message);
    });
