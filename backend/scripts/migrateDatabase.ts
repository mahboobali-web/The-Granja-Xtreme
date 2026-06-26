import mongoose from 'mongoose';

const OLD_URI = 'mongodb://mahboobali5961_db_user:vnIyr2dwBdfTzAth@ac-tvtvv87-shard-00-00.fbmhhbm.mongodb.net:27017,ac-tvtvv87-shard-00-01.fbmhhbm.mongodb.net:27017,ac-tvtvv87-shard-00-02.fbmhhbm.mongodb.net:27017/?ssl=true&replicaSet=atlas-aeqp8k-shard-0&authSource=admin';
const NEW_URI = 'mongodb://tgranjaxtreme065_db_user:EVZu39dUZmSCn0Nb@ac-wn204o5-shard-00-00.9ufjnjz.mongodb.net:27017,ac-wn204o5-shard-00-01.9ufjnjz.mongodb.net:27017,ac-wn204o5-shard-00-02.9ufjnjz.mongodb.net:27017/?ssl=true&authSource=admin&retryWrites=true&w=majority';

const migrate = async () => {
  try {
    console.log('Connecting to OLD database...');
    const oldDb = await mongoose.createConnection(OLD_URI).asPromise();
    
    console.log('Connecting to NEW database...');
    const newDb = await mongoose.createConnection(NEW_URI).asPromise();

    // The native mongodb driver's 'db' object is available on mongoose connection
    if (!oldDb.db || !newDb.db) {
      throw new Error('Database object is undefined');
    }

    const collections = await oldDb.db.listCollections().toArray();
    
    for (const collInfo of collections) {
      const collectionName = collInfo.name;
      console.log(`\nMigrating collection: ${collectionName}`);
      
      const oldCollection = oldDb.db.collection(collectionName);
      const newCollection = newDb.db.collection(collectionName);
      
      const documents = await oldCollection.find({}).toArray();
      console.log(`Found ${documents.length} documents in ${collectionName}`);
      
      if (documents.length > 0) {
        await newCollection.deleteMany({}); // Ensure clean state
        await newCollection.insertMany(documents);
        console.log(`Successfully inserted ${documents.length} documents into new ${collectionName}`);
      }
    }

    console.log('\nMigration complete!');
    await oldDb.close();
    await newDb.close();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
