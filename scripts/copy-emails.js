import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths relative to the project root (assuming script is run from project root)
const projectRoot = path.join(__dirname, '..');
const sourceRoot = path.join(projectRoot, '..'); // Parent directory of email-viewer

const directoriesToCopy = [
    'COLD PROSPECTS',
    'EXISTING CLIENTS'
];

async function copyEmails() {
    console.log('Starting email copy process...');

    for (const dir of directoriesToCopy) {
        const srcPath = path.join(sourceRoot, dir);
        const destPath = path.join(projectRoot, 'public', dir);

        try {
            // Check if source exists
            if (await fs.pathExists(srcPath)) {
                await fs.copy(srcPath, destPath, { overwrite: true });
                console.log(`✅ Copied ${dir} to public/${dir}`);
            } else {
                console.warn(`⚠️ Source directory not found: ${srcPath}`);
            }
        } catch (err) {
            console.error(`❌ Error copying ${dir}:`, err);
            process.exit(1);
        }
    }

    console.log('Email copy process complete.');
}

copyEmails();
