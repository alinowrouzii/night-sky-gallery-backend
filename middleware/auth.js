const jwt = require("jsonwebtoken");

const TOKEN_KEY = process.env.TOKEN_KEY;

// const verifyToken = (req, res, next) => {
//     const token =
//         req.body.token || req.query.token || req.headers["x-access-token"];

//     if (!token) {
//         return res.status(403).send("A token is required for authentication");
//     }
//     try {
//         const decoded = jwt.verify(token, TOKEN_KEY);
//         req.user = decoded;
//     } catch (err) {
//         return res.status(401).send("Invalid Token");
//     }
//     return next();
// };

const verifyToken = (req, res, next) => {
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

module.exports = verifyToken;
