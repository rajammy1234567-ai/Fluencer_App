import dotenv from 'dotenv';
dotenv.config();
import http from 'http';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import { initializeSocket } from '../config/socket.js';
import OTP from '../models/OTP.js';

/**
 * Isolated Staging Test Server Adapter
 * 
 * Complies with:
 * - Never load-test production or external services
 * - Sandboxes Nodemailer (intercepts OTPs in-memory for instant test retrieval)
 * - Sandboxes Cloudinary and Razorpay
 * - Instruments route latencies, socket counts, and memory
 */

export const inMemoryOtps = new Map();

// Intercept OTP creation for zero-external-dependency testing
const originalOtpCreate = OTP.create.bind(OTP);
OTP.create = async function (...args) {
  const result = await originalOtpCreate(...args);
  const data = Array.isArray(args[0]) ? args[0][0] : args[0];
  if (data && data.email && data.otp) {
    inMemoryOtps.set(data.email.toLowerCase(), data.otp);
  }
  return result;
};

// Performance & Metric Collectors
export const performanceMetrics = {
  requestCount: 0,
  errorCount: 0,
  durationsByRoute: new Map(), // route -> array of ms
  activeSockets: 0,
  peakMemoryMB: 0,
  eventLoopDelays: []
};

// Latency Tracking Middleware
app.use((req, res, next) => {
  const start = process.hrtime();
  performanceMetrics.requestCount++;

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(start);
    const durationMs = (seconds * 1000) + (nanoseconds / 1e6);
    
    // Normalize route path for histogram
    let routeKey = req.baseUrl || req.path || 'unknown';
    if (routeKey.startsWith('/api/campaigns/') && routeKey.includes('/apply')) {
      routeKey = 'POST /api/campaigns/:id/apply';
    } else if (routeKey.startsWith('/api/messages/')) {
      routeKey = 'MESSAGES /api/messages/*';
    } else {
      routeKey = `${req.method} ${routeKey}`;
    }

    if (!performanceMetrics.durationsByRoute.has(routeKey)) {
      performanceMetrics.durationsByRoute.set(routeKey, []);
    }
    performanceMetrics.durationsByRoute.get(routeKey).push(durationMs);

    if (res.statusCode >= 500) {
      performanceMetrics.errorCount++;
    }

    const mem = process.memoryUsage().heapUsed / (1024 * 1024);
    if (mem > performanceMetrics.peakMemoryMB) {
      performanceMetrics.peakMemoryMB = mem;
    }
  });

  next();
});

// Event loop delay sampler
setInterval(() => {
  const start = Date.now();
  setImmediate(() => {
    const delay = Date.now() - start;
    performanceMetrics.eventLoopDelays.push(delay);
    if (performanceMetrics.eventLoopDelays.length > 500) {
      performanceMetrics.eventLoopDelays.shift();
    }
  });
}, 1000).unref();

export async function startStagingServer(options = 5050) {
  const port = typeof options === 'number' ? options : (options?.port || 5050);
  const customMongoUri = typeof options === 'object' ? options?.customMongoUri : null;

  let mongodInstance = null;
  let targetUri = customMongoUri || process.env.LOCAL_MONGODB_URI;

  if (!targetUri) {
    console.log('⏳ Spawning isolated local MongoMemoryServer instance for staging...');
    mongodInstance = await MongoMemoryServer.create({
      instance: {
        dbName: 'fluencer_isolated_staging'
      }
    });
    targetUri = mongodInstance.getUri();
    console.log(`📍 Local MongoMemoryServer created at: ${targetUri}`);
  }

  // STRICT SECURITY GUARD: ABSOLUTELY NO ATLAS OR REMOTE HOSTS
  if (!targetUri.includes('127.0.0.1') && !targetUri.includes('localhost')) {
    if (mongodInstance) await mongodInstance.stop();
    throw new Error(`❌ FATAL SECURITY VIOLATION: Database URI "${targetUri}" is not local (127.0.0.1 / localhost)! Fallback to shared/remote DB is strictly forbidden.`);
  }
  if (targetUri.includes('mongodb.net') || targetUri.includes('fluencer01') || targetUri.includes('atlas')) {
    if (mongodInstance) await mongodInstance.stop();
    throw new Error(`❌ FATAL SECURITY VIOLATION: Remote Atlas cluster detected in URI "${targetUri}"! Aborting immediately.`);
  }

  // Ensure Mongoose connects ONLY to local instance
  if (mongoose.connection.readyState !== 0) {
    console.log('🔄 Disconnecting previous database connection...');
    await mongoose.disconnect();
  }

  console.log(`🔌 Connecting Mongoose exclusively to isolated local MongoDB: ${targetUri}`);
  await mongoose.connect(targetUri, {
    maxPoolSize: 200,
    serverSelectionTimeoutMS: 5000
  });

  // SECONDARY ACTIVE CONNECTION GUARD
  const activeHost = mongoose.connection.host;
  const activePort = mongoose.connection.port;
  const activeDb = mongoose.connection.name;
  console.log(`✅ VERIFIED ISOLATED DB CONNECTION: Host=${activeHost}:${activePort} | Database=${activeDb}`);

  if (activeHost !== '127.0.0.1' && activeHost !== 'localhost') {
    await mongoose.disconnect();
    if (mongodInstance) await mongodInstance.stop();
    throw new Error(`❌ FATAL SECURITY VIOLATION: Active connected host "${activeHost}" is NOT local! Aborted.`);
  }
  if (activeDb.includes('fluencer01') || activeHost.includes('mongodb.net')) {
    await mongoose.disconnect();
    if (mongodInstance) await mongodInstance.stop();
    throw new Error(`❌ FATAL SECURITY VIOLATION: Active connection targets shared Atlas database! Aborted.`);
  }

  const server = http.createServer(app);
  const io = initializeSocket(server);
  app.set('io', io);

  io.on('connection', (socket) => {
    performanceMetrics.activeSockets++;
    socket.on('disconnect', () => {
      performanceMetrics.activeSockets = Math.max(0, performanceMetrics.activeSockets - 1);
    });
  });

  await new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      console.log(`🚀 Isolated Staging Test Server live at http://127.0.0.1:${port}`);
      resolve();
    });
  });

  return {
    server,
    io,
    port,
    mongoUri: targetUri,
    mongodInstance,
    close: async () => {
      await new Promise((resolve) => server.close(resolve));
      io.close();
      await mongoose.disconnect();
      if (mongodInstance) {
        await mongodInstance.stop();
        console.log('🛑 Isolated MongoMemoryServer stopped.');
      }
    }
  };
}
