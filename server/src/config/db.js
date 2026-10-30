import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri && uri.trim() !== '') {
      console.log('Connecting to MongoDB via MONGODB_URI...');
      await mongoose.connect(uri);
      console.log(`✅ MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
      return;
    }

    // Fallback: If no URI provided, spin up in-memory MongoDB for instant zero-config dev/testing
    console.log('⚠️ No MONGODB_URI found. Initializing in-memory MongoDB fallback...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    const memUri = memoryServer.getUri();

    await mongoose.connect(memUri);
    console.log(`✅ Connected to In-Memory MongoDB (${memUri})`);
    console.log('💡 Tip: For persistent storage across server restarts or cloud deployment, set MONGODB_URI in server/.env');
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);

    // If external URI failed, try in-memory fallback in dev mode
    if (process.env.NODE_ENV !== 'production' && !memoryServer) {
      try {
        console.log('Attempting fallback to In-Memory MongoDB...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const memUri = memoryServer.getUri();
        await mongoose.connect(memUri);
        console.log(`✅ Fallback connected to In-Memory MongoDB (${memUri})`);
        return;
      } catch (fallbackError) {
        console.error(`❌ In-memory fallback failed: ${fallbackError.message}`);
      }
    }
    process.exit(1);
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
  }
};
