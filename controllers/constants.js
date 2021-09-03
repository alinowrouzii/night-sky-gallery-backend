
const path = require('path');
exports.jwtExpirySeconds = 300;

exports.uploadPath = path.join(__dirname, '..', 'uploads');


//maximum size = 6MB
exports.maximumFileSize = 6 * 1024 * 1024;