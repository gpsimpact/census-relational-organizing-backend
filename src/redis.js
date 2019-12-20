import Redis from "ioredis";
import { RedisPubSub } from "graphql-redis-subscriptions";
// import RedisSMQ from "rsmq";

export const pubsub = new RedisPubSub({
  publisher: new Redis(process.env.REDIS_URL),
  subscriber: new Redis(process.env.REDIS_URL)
});

// export const rsmq = new RedisSMQ(
//   process.env.REDIS_URL && require("redis-url").parse(process.env.REDIS_URL)
// );

// io redis client
export default new Redis(process.env.REDIS_URL);
