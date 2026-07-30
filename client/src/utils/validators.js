/**
 * @file validators.js
 * @description Comprehensive input validation & verification utilities for Cervify.
 * Enforces strict validation rules across all portal forms, roles, and contexts.
 */

/** Validates email address syntax (e.g. user@institution.edu) */
export function validateEmail(email) {
    if (!email || typeof email !== 'string') return { valid: false, message: 'Email address is required.' };
    const clean = email.trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(clean)) {
        return { valid: false, message: 'Please enter a valid email address (e.g. admin@institution.edu).' };
    }
    return { valid: true, message: '' };
}

/** Validates username (min 3 chars, letters, numbers, underscores) */
export function validateUsername(username) {
    if (!username || typeof username !== 'string') return { valid: false, message: 'Username is required.' };
    const clean = username.trim();
    if (clean.length < 3) {
        return { valid: false, message: 'Username must be at least 3 characters long.' };
    }
    const usernameRegex = /^[a-zA-Z0-9_.-]+$/;
    if (!usernameRegex.test(clean)) {
        return { valid: false, message: 'Username can only contain letters, numbers, hyphens, and underscores.' };
    }
    return { valid: true, message: '' };
}

/** Validates password strength (min 6 chars) */
export function validatePassword(password) {
    if (!password || typeof password !== 'string') return { valid: false, message: 'Password is required.' };
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters long.' };
    }
    return { valid: true, message: '' };
}

/** Validates student full name */
export function validateFullName(name) {
    if (!name || typeof name !== 'string') return { valid: false, message: 'Full name is required.' };
    const clean = name.trim();
    if (clean.length < 2) {
        return { valid: false, message: 'Full name must be at least 2 characters long.' };
    }
    return { valid: true, message: '' };
}

/** Validates Roll / Registration Number */
export function validateRollNo(rollNo) {
    if (!rollNo || typeof rollNo !== 'string') return { valid: false, message: 'Roll / Registration Number is required.' };
    const clean = String(rollNo).trim();
    if (clean.length < 1) {
        return { valid: false, message: 'Please enter a valid Roll / Registration Number.' };
    }
    return { valid: true, message: '' };
}

/** Validates Principal signature canvas or image payload */
export function validateSignature(signatureDataUrl) {
    if (!signatureDataUrl || typeof signatureDataUrl !== 'string' || signatureDataUrl.length < 50) {
        return { valid: false, message: 'Principal signature is required. Please draw your signature on the pad or upload a signature image.' };
    }
    return { valid: true, message: '' };
}

/** Validates security PIN */
export function validatePin(pin) {
    if (!pin || typeof pin !== 'string') return { valid: false, message: 'Security PIN is required.' };
    if (pin.trim().length < 3) {
        return { valid: false, message: 'Security PIN must be at least 3 characters.' };
    }
    return { valid: true, message: '' };
}
