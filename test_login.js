const bcrypt = require('bcryptjs');

// The hash from .env
const hash = '$2b$10$tUUemSJgbfXhTFH.LgwXJup6UoxMAp6i36lKZGRiXcgaGuCkCNdf2';
const password = 'RussoLux2026!';

bcrypt.compare(password, hash, (err, result) => {
    if (err) {
        console.error('bcrypt.compare() error:', err);
    } else {
        console.log('Password matches hash:', result);
    }
});
