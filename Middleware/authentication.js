const jwt = require("jsonwebtoken");

class Authentication {

    static async CreateToken(TokenPayloadObject) {
        try {
            return jwt.sign(TokenPayloadObject, process.env.JWT_KEY, { expiresIn: "10h" })
        } catch (error) {
            return error
        }
    }

    static async VerifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_KEY);
        } catch (error) {
            return error
        }
    }
}

module.exports = Authentication;