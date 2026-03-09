import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });

    return token; // For a production app this can be sent in an HTTP-Only cookie, but for now we return it in the response body.
};

export default generateToken;
