const jwt = require("jsonwebtoken");
const { userTypes } = require("../models/constants");

const { TOKEN_KEY } = process.env;

exports.verifyToken = (req, res, next) => {
    //take the token from cookie
    const token = req.cookies.token

    if (!token) {
        return res.status(401).send("A token is required for authentication");
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
    if (req.user.role === userTypes.ADMIN) {
        return next();
    }
    return res.status(403).json({ message: 'don\'t have permission cauz u r not admin!' });
}

exports.isSuperAdmin = (req, res, next) => {
    if (req.user.role === userTypes.SUPER_ADMIN) {
        return next();
    }
    return res.status(403).json({ message: 'don\'t have permission cauz u r not super admin!' });
}

