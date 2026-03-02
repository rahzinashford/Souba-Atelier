import helmet from "helmet";

const isProduction = process.env.NODE_ENV === "production";

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: isProduction 
        ? ["'self'"] 
        : ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: [
        "'self'",
        "data:",
        "https://images.unsplash.com",
        "https://unsplash.com",
        "blob:"
      ],
      fontSrc: ["'self'", "data:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      workerSrc: isProduction ? ["'self'"] : ["'self'", "blob:"],
      childSrc: isProduction ? ["'self'"] : ["'self'", "blob:"],
      upgradeInsecureRequests: isProduction ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "same-site" },
  crossOriginOpenerPolicy: { policy: "same-origin" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: isProduction
    ? {
        maxAge: 15768000,
        includeSubDomains: true,
        preload: true,
      }
    : false,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
});
