const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function checkHash() {
    const envPath = path.join(__dirname, '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');

    // Manual parsing to avoid dotenv differences
    const lines = envContent.split('\n');
    let adminPassword = '';

    for (const line of lines) {
        if (line.startsWith('ADMIN_PASSWORD=')) {
            adminPassword = line.split('=')[1].trim();
            // Remove surrounding quotes if present
            if (adminPassword.startsWith("'") && adminPassword.endsWith("'")) {
                adminPassword = adminPassword.slice(1, -1);
            }
            if (adminPassword.startsWith('"') && adminPassword.endsWith('"')) {
                adminPassword = adminPassword.slice(1, -1);
            }
            break;
        }
    }

    console.log('--- DIAGNOSTIC START ---');
    console.log('Testing Password: RussoLux2026!');
    console.log('Stored Hash (raw from file):', adminPassword);

    try {
        const isMatch = await bcrypt.compare('RussoLux2026!', adminPassword);
        console.log('Bcrypt Compare Result:', isMatch);

        if (isMatch) {
            console.log('✅ HASH IS VALID');
        } else {
            console.log('❌ HASH IS INVALID');

            // Generate a correct hash
            const newHash = await bcrypt.hash('RussoLux2026!', 10);
            console.log('Suggested New Hash:', newHash);
        }
    } catch (error) {
        console.error('Error during comparison:', error);
    }
    console.log('--- DIAGNOSTIC END ---');
}

checkHash();
