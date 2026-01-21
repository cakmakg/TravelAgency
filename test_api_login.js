const http = require('http');

const data = JSON.stringify({
    email: 'admin@russoluxtours.de',
    password: 'RussoLux2026!'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'User-Agent': 'Test-Client'
    }
};

const req = http.request(options, (res) => {
    console.log(`\nStatus Code: ${res.statusCode}`);
    console.log('Headers:', JSON.stringify(res.headers, null, 2));

    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('\nResponse Body:');
        try {
            console.log(JSON.stringify(JSON.parse(responseData), null, 2));
        } catch {
            console.log(responseData);
        }
    });
});

req.on('error', (error) => {
    console.error('Request error:', error);
});

console.log('Sending login request...');
console.log('Email: admin@russoluxtours.de');
console.log('Password: RussoLux2026!');

req.write(data);
req.end();
