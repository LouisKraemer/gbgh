var express = require('express'),
    cors = require('cors'),
    app = express(),
    path = require('path');

app.use(cors());

app.use('/', express.static(__dirname));

app.listen(4000);

console.log('Server started on port : ' + 4000);