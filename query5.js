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
    const tweetId = doc.id_str || doc.id.toString();
    const screenName = doc.user.screen_name;
    await redisClient.rPush(`tweets:${screenName}`, tweetId);
    //store tweet data as a hash
    await redisClient.hSet(`tweet:${tweetId}`, {
        user_name: doc.user.screen_name,
        text: doc.text || '',
        created_at: doc.created_at || '',
        favorite_count: (doc.favorite_count || 0).toString(),
        retweet_count: (doc.retweet_count || 0).toString()
    });
}

// demo: print one user's tweets
console.log('Structure created successfully');

await redisClient.disconnect();
await mongoClient.close();