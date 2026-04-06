import { createClient } from 'redis';
import { MongoClient } from 'mongodb';

const redisClient = createClient();
await redisClient.connect();

const mongoClient = new MongoClient('mongodb://localhost:27017');
await mongoClient.connect();
const db = mongoClient.db('ieeevisTweets');
const tweets = db.collection('tweet');

const cursor = tweets.find();
for await (const doc of cursor) {
    await redisClient.sAdd('screen_names', doc.user.screen_name);
}

const distinctCount = await redisClient.sCard('screen_names');
console.log(`Distinct users: ${distinctCount}`);

await redisClient.disconnect();
await mongoClient.close();