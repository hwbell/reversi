var path = require('path');
var express = require('express');
var strftime = require('strftime');


var app = express();

app.use(express.static(path.join(__dirname, 'public')));

app.listen(process.env.PORT || 8080);
