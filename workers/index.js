// playing with a single worker for now. Maybe split out later if necessary
require("dotenv").config();

// let throng = require("throng");
var Queue = require("bull");
// const bunyan = require("bunyan");

// let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
// let workers = process.env.WEB_CONCURRENCY || 2;
let maxJobsPerWorker = 50;

var censusGeocodeQueue = new Queue("censusGeocodeQueue", process.env.REDIS_URL);

const config = require("../knexfile.js");
const db = require("knex")(config);
var rp = require("request-promise");

// const level = process.env.LOG_LEVEL || "info";

// const logger = bunyan.createLogger({
//   name: "census-backend-workers",
//   devEnv: process.env.NODE_ENV,
//   streams: [{ stream: process.stdout, level }]
// });

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

function start() {
  console.log("Starting workers", { redis: process.env.REDIS_URL });
  censusGeocodeQueue.process(maxJobsPerWorker, async ({ data }, done) => {
    // job.data contains the custom data passed when the job was created
    // job.id contains id of this job.
    // logger.info({ jobData: data });
    console.log({ jobData: data });
    let tract;
    try {
      const cdata = await tractLookup(
        data.address,
        data.city,
        data.state,
        data.zip
      );

      if (cdata.result.addressMatches.length === 0) {
        return new Error("No matches for address");
      }

      tract = cdata.result.addressMatches[0].geographies["Census Tracts"][0];
    } catch (error) {
      done(new Error("Can not call census api"));
    }

    // logger.info(
    //   {
    //     geocodeResults: {
    //       tract_geoid: tract && tract.GEOID,
    //       tract_centlat: tract && tract.CENTLAT,
    //       tract_centlon: tract && tract.CENTLON,
    //       tract_state: tract && tract.STATE,
    //       tract_name: tract && tract.NAME,
    //       tract_county: tract && tract.COUNTY,
    //       targetId: data.targetId
    //     }
    //   },
    //   "geocode results"
    // );
    console.log(
      {
        geocodeResults: {
          tract_geoid: tract && tract.GEOID,
          tract_centlat: tract && tract.CENTLAT,
          tract_centlon: tract && tract.CENTLON,
          tract_state: tract && tract.STATE,
          tract_name: tract && tract.NAME,
          tract_county: tract && tract.COUNTY,
          targetId: data.targetId
        }
      },
      "geocode results"
    );

    if (data.targetId && tract && tract.GEOID) {
      await db("targets")
        .update({ census_tract: tract.GEOID })
        .where({ id: data.targetId });
      done();
    } else {
      done(new Error("Can not parse results"));
    }
  });
}

// This will only be called once
// function startMaster() {
//   console.log("started Worker process");
//   // logger.info("started worker process");
// }

// throng({ workers, start, master: startMaster });

// censusGeocodeQueue.add(
//   {
//     address: "765 Ash St",
//     city: "Lawrence",
//     state: "KS",
//     zip: "66044",
//     targetId: "00864e3a-da19-4173-828b-295c34b6fb6e"
//   },
//   {
//     removeOnComplete: true,
//     attempts: 10,
//     backoff: {
//       type: "exponential",
//       delay: 1000
//     }
//   }
// );

start();
