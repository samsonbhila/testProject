const WebSocket = require('ws');

const startWebSocketClient = () => {
    const url = 'wss://challenge.sedilink.co.za:3006';
    const ws = new WebSocket(url);

    ws.on('open', function open() {
        const originalString = 'Hello, World!';
        console.log(`Sending: ${originalString}`);
        ws.send(originalString);
    });

    ws.on('message', function incoming(data) {
        const reversedString = data.toString();
        const originalString = 'Hello, World!'; 
    
        console.log(`Received: ${reversedString}`);
        console.log(`Expected: ${originalString.split('').reverse().join('')}`);
    
        if (reversedString === originalString.split('').reverse().join('')) {
            console.log('Verification successful: Received string matches reversed original.');
        } else {
            console.log('Verification failed: Strings do not match.');
        }
    
        ws.close();
    });
    

    ws.on('error', function error(err) {
        console.error('WebSocket error:', err);
    });
};

module.exports = { startWebSocketClient };
