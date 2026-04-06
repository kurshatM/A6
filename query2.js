import { createClient } from 'redis';
import { MongoClient } from 'mongodb';

const redisClient = createClient();
await redisClient.connect();

const mongoClient = new MongoClient('mongodb://localhost:27017');
await mongoClient.connect();
const db = mongoClient.db('ieeevisTweets');
const tweets = db.collection('tweet');

await redisClient.set('favoritesSum', 0);

const cursor = tweets.find();
for await (const doc of cursor) {
  const favCount = doc.favorite_count || 0;
  await redisClient.incrBy('favoritesSum', favCount);
}

const total = await redisClient.get('favoritesSum');
console.log(`Total favorites: ${total}`);

await redisClient.disconnect();
await mongoClient.close();