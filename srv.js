
import app from "./app.js";
// var debug = require('debug')('obda:server');
import * as http from 'http';

var port = normalizePort(process.env.npm_package_config_port || process.env.PORT || '6661');
app.set('port', port);

var server = http.createServer(app);

app.listen(port, ()=>{
    console.log(`---------- server(${process.env.APP_NAME}:${process.env.NODE_ENV}) is running on: http://localhost:${port} ----------`);
});
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    switch (error.code) {
        case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
        case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
        default:
        throw error;
    }
}

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    // debug('Listening on ' + bind);
}
 