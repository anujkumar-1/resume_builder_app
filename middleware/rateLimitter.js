import { rateLimit } from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 15, // Tighter limit for security
    message: {
        status: 429,
        error: "Too many login/signup attempts. Please try again after 15 minutes."
    },
    skip: (req, res) => process.env.NODE_ENV === 'development',
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

export const thirdPartyStrictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Tighter limit for security
    message: {
        status: 429,
        error: "Too many forget password attempts. Please try again after 15 minutes."
    },
    skip: (req, res) => process.env.NODE_ENV === 'development',
    standardHeaders: 'draft-7',
    legacyHeaders: false,
});

export const internalApiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100, 
    message: { status: 429, error: "Internal API limit reached." },
    skip: (req, res) => process.env.NODE_ENV === 'development',
    standardHeaders: 'draft-7',
});