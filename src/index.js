import { GraphQLServer } from "graphql-yoga";
import cors from "cors";
import jwt from "express-jwt";

// import redis from "./redis";
import { default as typeDefs } from "./typeDefinitions";
import resolvers from "./resolvers";
import context from "./context";

import lowerCaseEmailMW from "./middleware/lowerCaseEmail";
import createSlugMW from "./middleware/createSlug";
import defaultToAuthedUserMW from "./middleware/defaultToAuthedUser";
import permissionsMiddleware from "./middleware/permissions";

require("dotenv").config();

// const isDeployed =
//   process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";

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

// auth middleware
server.express.use(
  jwt({
    secret: process.env.TOKEN_SECRET,
    credentialsRequired: false
  })
);

server.express.use(
  cors({
    credentials: true,
    origin: process.env.FRONTEND_HOST
  })
);

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
