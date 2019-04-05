import { GraphQLServer } from "graphql-yoga";
import cors from "cors";
import session from "express-session";
import connectRedis from "connect-redis";

import redis from "./redis";
import { default as typeDefs } from "./typeDefinitions";
import resolvers from "./resolvers";
import context from "./context";

import lowerCaseEmailMW from "./middleware/lowerCaseEmail";
import createSlugMW from "./middleware/createSlug";
import defaultToAuthedUserMW from "./middleware/defaultToAuthedUser";
import permissionsMiddleware from "./middleware/permissions";

require("dotenv").config();

const isDeployed =
  process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: ({ request, response }) => context(request, response),
  middlewares: [
    defaultToAuthedUserMW,
    permissionsMiddleware,
    lowerCaseEmailMW,
    createSlugMW
  ]
});

server.express.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_HOST
  })
);

const RedisStore = connectRedis(session);

const sessionOptions = {
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 1 * 365 // 1 years
  },
  name: "qid",
  resave: false,
  saveUninitialized: false,
  secret: process.env.TOKEN_SECRET,
  store: new RedisStore({
    client: redis
  })
};

if (isDeployed) {
  server.express.set("trust proxy", 1); // trust first proxy
  // sessionOptions.cookie.secure = true; // serve secure cookies
}

server.express.use(session(sessionOptions));

// eslint-disable-next-line no-console
// const endpoint = "/graphql";
// server.start({ endpoint }, () =>
//   console.log(`Server is running on localhost:${process.env.PORT}/${endpoint}`)
// );

const options = {
  endpoint: "/graphql",
  subscriptions: "/subscriptions",
  playground: "/playground",
  cors: false
};

server.start(options, ({ port }) =>
  console.log(
    `Server started, listening on port ${port} for incoming requests.`
  )
);
