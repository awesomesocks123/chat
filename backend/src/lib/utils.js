import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  
  // Set the token as an HTTP-only cookie for security
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // Prevent XSS attacks (cross-site scripting attack)
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
  
  return token;
};
