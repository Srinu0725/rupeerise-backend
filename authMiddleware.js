import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET;

const  authMiddleware = (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const token = req.headers.authorization?.split(" ")[1]; // "Bearer <token>"
        if (!token) return res.status(401).json({ message: "Access Denied" });

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId; // Attach userId to request

        next(); // Move to the next middleware
    } catch (error) {
        res.status(403).json({ message: "Invalid Token" });
    }
};

export default authMiddleware;