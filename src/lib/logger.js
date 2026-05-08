import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const AUDIT_LOG_FILE = path.join(LOG_DIR, 'audit.log');

// Ensure log directory exists
function ensureLogDir() {
    if (!fs.existsSync(LOG_DIR)) {
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
}

// Format log entry
function formatLogEntry(level, category, message, metadata = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(metadata).length > 0 ? ` | ${JSON.stringify(metadata)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] [${category}] ${message}${metaStr}\n`;
}

// Write to log file
function writeLog(entry) {
    try {
        ensureLogDir();
        fs.appendFileSync(AUDIT_LOG_FILE, entry);
    } catch (error) {
        console.error('Failed to write to log file:', error);
    }
}

// Log data modification
export function logDataModification(action, entity, entityId, details = {}) {
    const message = `${action} ${entity} (ID: ${entityId})`;
    const entry = formatLogEntry('info', 'DATA_MODIFICATION', message, details);
    writeLog(entry);
}

// Log validation failure
export function logValidationFailure(timetableId, validationErrors) {
    const message = `Validation failed for timetable ${timetableId}`;
    const entry = formatLogEntry('warn', 'VALIDATION', message, { 
        errorCount: validationErrors.length,
        errors: validationErrors 
    });
    writeLog(entry);
}

// Log auto-generation event
export function logAutoGeneration(timetableId, staffCount, assignmentCount, duration) {
    const message = `Auto-generated schedule for timetable ${timetableId}`;
    const entry = formatLogEntry('info', 'AUTO_GENERATION', message, {
        staffCount,
        assignmentCount,
        durationMs: duration
    });
    writeLog(entry);
}

// Log error
export function logError(category, message, error) {
    const entry = formatLogEntry('error', category, message, {
        error: error.message,
        stack: error.stack
    });
    writeLog(entry);
}

// Log info
export function logInfo(category, message, metadata = {}) {
    const entry = formatLogEntry('info', category, message, metadata);
    writeLog(entry);
}

// Read recent logs
export function getRecentLogs(lines = 100) {
    try {
        if (!fs.existsSync(AUDIT_LOG_FILE)) {
            return [];
        }

        const content = fs.readFileSync(AUDIT_LOG_FILE, 'utf-8');
        const allLines = content.split('\n').filter(line => line.trim());
        return allLines.slice(-lines);
    } catch (error) {
        console.error('Failed to read logs:', error);
        return [];
    }
}
