import jwt from "jsonwebtoken";

const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return secret;
};

const getJWTExpiry = () => {
  return process.env.JWT_EXPIRES_IN || "7d";
};

export function signToken(payload) {
  const options = {
    expiresIn: getJWTExpiry(),
  };
  return jwt.sign(payload, getJWTSecret(), options);
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, getJWTSecret());
    return decoded;
  } catch (err) {
    return null;
  }
}
