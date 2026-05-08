import mongoose from 'mongoose';

// Cached connection pattern: Next.js dev mode reloads modules frequently. We attach
// the mongoose connection to globalThis so we don't open a new connection on every
// HMR update or every API call. Recommended pattern from Next.js docs.

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    // Don't throw at module load — let the first connect() call surface the error
    // so build-time imports don't crash before .env is read.
    console.warn('[mongo] MONGODB_URI is not set in .env.local');
}

let cached = globalThis._mongoose;

if (!cached) {
    cached = globalThis._mongoose = { conn: null, promise: null };
}

export async function connectMongo() {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is required. Add it to .env.local');
        }

        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m);
    }

    try {
        cached.conn = await cached.promise;
    } catch (err) {
        cached.promise = null;
        throw err;
    }

    return cached.conn;
}

export default connectMongo;
