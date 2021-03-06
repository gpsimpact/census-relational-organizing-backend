import { addOneHOR } from "@jakelowen/sqorn-graphql-filters";
import _ from "lodash";

export default async (root, args, context) => {
  // make sure team exists
  const existingTeam = await context.dataSource.team.byIdLoader.load(
    args.input.teamId
  );
  if (!existingTeam) {
    return {
      success: false,
      code: "INPUT_ERROR",
      message: "No team with this id exists.",
      item: null
    };
  }

  // make lowercase email
  const lowerEmail = args.input.email && args.input.email.toLowerCase();
  let writeInput = Object.assign({}, args.input, {
    userId: context.user.id
  });
  if (lowerEmail) {
    writeInput.email = lowerEmail;
  }

  // let activeTibs = [];
  // extract activeTibs from dbWrite
  // if (writeInput.activeTibs) {
  //   activeTibs = activeTibs.concat(writeInput.activeTibs);
  //   writeInput = _.omit(writeInput, "activeTibs");
  // }

  if (writeInput.phone) {
    // strip all non digits out.
    writeInput.phone = writeInput.phone.replace(/\D/g, "");
  }

  let addressData;
  // If have address in it, grab it into own element
  if (writeInput.address) {
    addressData = {
      address: writeInput.address,
      city: writeInput.city,
      state: writeInput.state,
      zip5: writeInput.zip5
    };
  }

  if (!writeInput.retainAddress) {
    writeInput = _.omit(writeInput, ["address", "city", "state"]);
  }

  if (writeInput.householdMembers) {
    writeInput.householdMembers = JSON.stringify(writeInput.householdMembers);
  }

  const writeArgs = Object.assign({}, args, { input: writeInput });

  const target = await addOneHOR(
    "dataSource.target.create",
    "input",
    "CREATE_TARGET"
  )(root, writeArgs, context);

  // now apply activeTibs
  // if (activeTibs.length > 0) {
  //   const writeTibs = _.map(activeTibs, x => {
  //     return { targetId: target.id, tibId: x };
  //   });

  //   await context.sq`target_true_tibs`.insert(writeTibs);
  // }

  if (
    addressData &&
    context.workerQueues &&
    context.workerQueues.censusGeocode
  ) {
    context.workerQueues.censusGeocode.add(
      {
        ...addressData,
        targetId: target.id
      },
      {
        removeOnComplete: true,
        attempts: 10,
        backoff: {
          type: "exponential",
          delay: 1000
        }
      }
    );
  }

  return {
    success: true,
    code: "OK",
    message: "Target created.",
    item: target
  };
};
