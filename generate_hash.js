const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question('Enter password to hash: ', (password) => {
    if (!password || password.length < 8) {
        console.error('Error: Password must be at least 8 characters long.');
        rl.close();
        process.exit(1);
    }

    bcrypt.hash(password, 10).then((hash) => {
        console.log('\n--- Generated Bcrypt Hash ---');
        console.log(hash);
        console.log('----------------------------');
        console.log('\nSet this as ADMIN_PASSWORD in your .env file.');
        rl.close();
    });
});
