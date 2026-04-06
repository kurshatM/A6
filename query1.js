import { createClient } from 'redis';
import { MongoClient } from 'mongodb';

const redisClient = createClient();
await redisClient.connect();

const mongoClient = new MongoClient('mongodb://localhost:27017');
await mongoClient.connect();
const db = mongoClient.db('ieeevisTweets');
const tweets = db.collection('tweet');

await redisClient.set('tweetCount', 0);

const cursor = tweets.find();
for await (const doc of cursor) {
  await redisClient.incr('tweetCount');
}

const count = await redisClient.get('tweetCount');
console.log(`There were ${count} tweets`);

await redisClient.disconnect();
await mongoClient.close();