import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    let token = req.cookies.jwt;
    
    // Check Authorization header if no cookie token
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Using token from Authorization header');
    }

    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // Find the user
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Add user to request object
    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
