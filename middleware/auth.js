const jwt = require("jsonwebtoken");

const TOKEN_KEY = process.env.TOKEN_KEY;

exports.verifyToken = (req, res, next) => {
    //take the token from cookie
    const token = req.cookies.token

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }

    try {
        const payload = jwt.verify(token, TOKEN_KEY);
        req.user = payload;
    } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Invalid Token" });
        }
        return res.status(400).json({ message: 'Bad request' });
    }
    return next();
}

exports.isAdmin = (req, res, next) => {
    if (req.user.role === 'ADMIN') {
        return next();
    }
    res.status(401).json({ message: 'don\'t have permission cauz u r not admin!' });
}
