// playing with a single worker for now. Maybe split out later if necessary
require("dotenv").config();

const RSMQWorker = require("rsmq-worker");
const RedisSMQ = require("rsmq");
const rsmq = new RedisSMQ(
  process.env.REDIS_URL && require("redis-url").parse(process.env.REDIS_URL)
);
const config = require("../knexfile.js");
const db = require("knex")(config);
var rp = require("request-promise");

const bunyan = require("bunyan");

const level = process.env.LOG_LEVEL || "info";

// Create a Bunyan logger that streams to Stackdriver Logging
// Logs will be written to: "projects/YOUR_PROJECT_ID/logs/bunyan_log"
const logger = bunyan.createLogger({
  // The JSON payload of the log as it appears in Stackdriver Logging
  // will contain "name": "my-service"
  name: "census-backend-workers",
  devEnv: process.env.NODE_ENV,
  streams: [
    // Log to the console at 'info' and above
    { stream: process.stdout, level }
    // And log to Stackdriver Logging, logging at 'info' and above
  ]
});

const tractLookup = async (street, city, state, zip) => {
  var options = {
    uri: "https://geocoding.geo.census.gov/geocoder/geographies/address",
    qs: {
      street,
      city,
      state,
      zip,
      benchmark: 4,
      vintage: 4,
      layers: "4,8",
      format: "json"
    },
    headers: {
      "User-Agent": "Request-Promise"
    },
    json: true // Automatically parses the JSON string in the response
  };

  return rp(options);
};

const censusGeocodeWorker = new RSMQWorker(
  process.env.CENSUS_GEOCODE_QUEUE_NAME,
  { rsmq }
);

censusGeocodeWorker.on("message", async function(msg, next, id) {
  // process your message
  logger.debug("Message id : " + id);
  let payload;
  try {
    payload = JSON.parse(msg);
  } catch {
    payload = msg;
  }
  let tract;
  try {
    const cdata = await tractLookup(
      payload.address,
      payload.city,
      payload.state,
      payload.zip
    );

    if (cdata.result.addressMatches.length === 0) {
      return new Error("No matches for address");
    }

    tract = cdata.result.addressMatches[0].geographies["Census Tracts"][0];
  } catch (error) {
    throw new Error("Can not call census api");
  }

  logger.debug("TRACT >>>>>>", tract);
  logger.debug({
    tract_geoid: tract.GEOID,
    tract_centlat: tract.CENTLAT,
    tract_centlon: tract.CENTLON,
    tract_state: tract.STATE,
    tract_name: tract.NAME,
    tract_county: tract.COUNTY,
    targetId: payload.targetId
  });

  if (payload.targetId && tract && tract.GEOID) {
    await db("targets")
      .update({ census_tract: tract.GEOID })
      .where({ id: payload.targetId });
    next();
  }
});

// optional error listeners
censusGeocodeWorker.on("error", function(err, msg) {
  logger.error("ERROR", err, msg.id);
});
censusGeocodeWorker.on("exceeded", function(msg) {
  logger.warn("EXCEEDED", msg.id);
});
censusGeocodeWorker.on("timeout", function(msg) {
  logger.warn("TIMEOUT", msg.id, msg.rc);
});

censusGeocodeWorker.start();

// just for testing

// rsmq.sendMessage(
//   {
//     qname: process.env.CENSUS_GEOCODE_QUEUE_NAME,
//     message: JSON.stringify({
//       address: "765 Ash St",
//       city: "Lawrence",
//       state: "KS",
//       zip: "66044",
//       targetId: "00864e3a-da19-4173-828b-295c34b6fb6e"
//     }),
//     delay: 0
//   },
//   err => {
//     if (err) {
//       console.error(err);
//       return;
//     }
//   }
// );
// console.log("pushed new message into queue");
