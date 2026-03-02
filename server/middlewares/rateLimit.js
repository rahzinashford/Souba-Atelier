import rateLimit from 'express-rate-limit';

const createRateLimitHandler = (message) => (req, res, next, options) => {
  res.status(429).json({
    error: "RATE_LIMITED",
    message
  });
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler("Too many requests. Please slow down."),
  validate: { xForwardedForHeader: false }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler("Too many login attempts. Please try again later."),
  skipSuccessfulRequests: false,
  validate: { xForwardedForHeader: false }
});

export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler("Too many admin requests. Please slow down."),
  keyGenerator: (req) => {
    const userId = req.user?.id || '';
    const ip = req.ip || 'unknown';
    return userId ? `admin-${ip}-${userId}` : `admin-${ip}`;
  },
  validate: { xForwardedForHeader: false, keyGeneratorIpFallback: false }
});

export const checkoutLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler("Too many checkout requests. Please slow down."),
  validate: { xForwardedForHeader: false }
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: createRateLimitHandler("Too many messages sent. Please try again later."),
  validate: { xForwardedForHeader: false }
});
