const bcrypt = require('bcryptjs');
const fs = require('fs');

bcrypt.hash('RussoLux2026!', 10).then(hash => {
    console.log('HASH_START:' + hash + ':HASH_END');
    fs.writeFileSync('secret_hash.txt', hash);
});
