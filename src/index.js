import { GraphQLServer } from "graphql-yoga";
import cors from "cors";
import jwt from "express-jwt";
var Queue = require("bull");

// import fs from "fs";

// messaging
// import { PubSub } from "@google-cloud/pubsub";
// import messageHandler from "./pubsubMessageHandlers";

// Logging
import bunyan from "bunyan";
// import { LoggingBunyan } from "@google-cloud/logging-bunyan";

import { default as typeDefs } from "./typeDefinitions";
import resolvers from "./resolvers";
import context from "./context";

// Middleware
import loggingMW from "./middleware/logging";
import lowerCaseEmailMW from "./middleware/lowerCaseEmail";
import createSlugMW from "./middleware/createSlug";
import defaultToAuthedUserMW from "./middleware/defaultToAuthedUser";
import permissionsMiddleware from "./middleware/permissions";

require("dotenv").config();

// download json key from google and minify with npx minify-json <file>.
// use that oneline in ENV SERVICE_ACCOUNT_JSON
// use a FULL qualified path to where you want key to exist on disk.
// populate file on disk needed for gcloud credentials
// fs.writeFileSync(
//   process.env.GOOGLE_APPLICATION_CREDENTIALS,
//   process.env.SERVICE_ACCOUNT_JSON
// );

// Creates a Bunyan Stackdriver Logging client
// const loggingBunyan = new LoggingBunyan();

const level = process.env.LOG_LEVEL || "info";

// Create a Bunyan logger that streams to Stackdriver Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/bunyan_log"
const logger = bunyan.createLogger({
  // The JSON payload of the log as it appears in Stackdriver Logging
  // will contain "name": "my-service"
  name: "census-backend",
  devEnv: process.env.NODE_ENV,
  streams: [
    // Log to the console at 'info' and above
    { stream: process.stdout, level }
    // And log to Stackdriver Logging, logging at 'info' and above
  ]
});

// set up gcloud pubsub messaging
// Creates a client
// const gcPubsub = new PubSub();
// // References an existing subscription
// const subscription = gcPubsub.subscription(
//   process.env.GCLOUD_PUBSUB_INBOUND_SUBSCRIPTION_NAME
// );

// const isDeployed =
//   process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging";

const workerQueues = {
  censusGeocode: new Queue("censusGeocodeQueue", process.env.REDIS_URL)
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
  context: ({ request, response }) =>
    context(request, response, logger, workerQueues),
  middlewares: [
    loggingMW,
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
  // subscriptions: "/subscriptions",
  playground: "/playground",
  cors: false,
  formatError: err => {
    logger.error({ err });
    return { message: err.message };
  },
  formatResponse: response => {
    logger.debug(response);
    return response;
  }
};

server.start(options, ({ port }) => {
  // Writes some log entries
  logger.info(
    `Server started, listening on port ${port} for incoming requests.`
  );
  // Listen for new messages until timeout is hit
  // subscription.on(`message`, messageHandler);
});
