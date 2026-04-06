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
    await redisClient.zIncrBy('leaderboard', 1, doc.user.screen_name);
}

const top10 = await redisClient.zRangeWithScores('leaderboard', -10, -1, { REV: false });
top10.reverse();

console.log('Top 10 users by tweet count:');
top10.forEach((entry, i) => {
    console.log(`${i + 1}. ${entry.value}: ${entry.score} tweets`);
});

await redisClient.disconnect();
await mongoClient.close();