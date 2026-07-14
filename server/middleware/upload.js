/**
 * @file upload.js  (middleware)
 * @description Multer disk-storage configuration for activity document uploads.
 *
 * Creates the `uploads/` directory under the server root if it does not exist,
 * then configures Multer to store files there with unique, timestamped names
 * that preserve the original file extension.
 *
 * The configured `upload` instance is exported for use in activity routes that
 * accept file uploads (notice, brochure, attendance sheet, certificate design).
 *
 * Usage example:
 * @example
 * const { upload } = require('../middleware/upload');
 * router.post('/:id/upload', upload.fields([{ name: 'notice' }]), handler);
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

/** Absolute path to the uploads directory that stores all activity documents. */
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure the uploads directory exists before the first request arrives
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    console.log('[Upload] Created uploads directory at', UPLOADS_DIR);
}

/**
 * Multer disk-storage engine:
 *  - destination: always `server/uploads/`
 *  - filename: `<fieldname>-<timestamp>-<random9digits>.<original_ext>`
 */
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOADS_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

/** Configured Multer instance ready for `.single()`, `.fields()`, etc. */
const upload = multer({ storage });

module.exports = { upload, UPLOADS_DIR };
