import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data.json');

// Initial data structure
const initialData = {
    timetables: []
};

// Helper to read data
export function readData() {
    try {
        if (!fs.existsSync(DATA_FILE)) {
            fs.writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
            return initialData;
        }
        const content = fs.readFileSync(DATA_FILE, 'utf-8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Error reading data:', error);
        return initialData;
    }
}

// Helper to write data
export function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing data:', error);
    }
}

// Simple ID generator
export function generateId() {
    return Math.random().toString(36).substring(2, 11);
}
