const express = require('express');
const morgan = require("morgan");
const cors = require('cors');
const compression = require('compression');
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer();

/**
 * Create Express Server
 */
const app = express();
app.use(express.urlencoded({ 'extended': 'true', 'limit': '50mb' }));

/**
 * Handling CORS
 */
const corsOptionsDelegate = function (req, callback) {
    var corsOptions = { origin: true };
    callback(null, corsOptions)
}
app.use(cors(corsOptionsDelegate));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'DELETE, PUT');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Token");
    next();
});

/**
 * Logging purpose
 */
app.use(morgan('dev'));

/**
 * Proxy endpoint
 */
app.use('*', (req, res) => {
    const target = req.headers['target'];
    const path = req.baseUrl;
    if (target) {
        proxy.web(req, res, { changeOrigin: true, target: target + path }, (err) => {
            res.status(400).json({ message: "Failed to hit your API" });
        });
    } else {
        res.json({
            message: "Input target host, example: http://your-api.com"
        });
    }
});

// Start the Proxy
app.use(compression());
app.set('port', 8080);
app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});