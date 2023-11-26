const jwt = require('jsonwebtoken');

// Middleware to verify token
// Function to be used by every router to protected like /content below
const verifyToken = (req, res, next) => {
    const bearerHeader = req.headers['authorization'];
    console.log('bearerHeader: ', bearerHeader);
    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];

        jwt.verify(bearerToken, process.env.SECRET, (err, authData) => {
            if (err) {
                res.sendStatus(403); // Forbidden
            } else {
                next();
            }
        });
    } else {
        res.sendStatus(401); // Unauthorized
    }
};

module.exports = verifyToken;