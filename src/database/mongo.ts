import mongoose from 'mongoose';

const uri: string =
    "mongodb+srv://testuser:testuser@cluster0.qgusyn0.mongodb.net/jobboard?retryWrites=true&w=majority&appName=Cluster0";

// Explicitly type options as mongoose.ConnectOptions so that the literal "1" is inferred correctly.
const clientOptions: mongoose.ConnectOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true }
};

export const connectDB = async (): Promise<void> => {
  try {
    // Connect to MongoDB using the provided URI and options.
    await mongoose.connect(uri, clientOptions);
    // Use the non-null assertion operator (!) to tell TypeScript that `db` is not undefined.
    await mongoose.connection.db!.admin().command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
};

// If this file is run directly, connect then disconnect from MongoDB for testing.
if (require.main === module) {
  (async () => {
    await connectDB();
    await disconnectDB();
  })().catch(console.error);
}
