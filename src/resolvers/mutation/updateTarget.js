import { updateOneHOR } from "@jakelowen/sqorn-graphql-filters";
import _ from "lodash";

export default async (root, args, context) => {
  // make sure team exists
  const existing = await context.dataSource.target.byIdLoader.load(args.id);
  if (!existing) {
    return {
      success: false,
      code: "INPUT_ERROR",
      message: "No target with this id exists.",
      item: null
    };
  }

  // make lowercase email
  const lowerEmail = args.input.email && args.input.email.toLowerCase();
  let writeInput = Object.assign({}, args.input);
  if (lowerEmail) {
    writeInput.email = lowerEmail;
  }

  // let activeTibs = [];
  // // extract activeTibs from dbWrite
  // if (writeInput.activeTibs) {
  //   activeTibs = activeTibs.concat(writeInput.activeTibs);
  //   writeInput = _.omit(writeInput, "activeTibs");
  // }

  if (writeInput.householdMembers) {
    writeInput.householdMembers = JSON.stringify(writeInput.householdMembers);
  }

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
    writeInput = Object.assign({}, writeInput, {
      address: null,
      city: null,
      state: null
    });
  }

  const writeArgs = Object.assign({}, args, { input: writeInput });

  // now apply activeTibs
  // if (activeTibs.length > 0) {
  //   const writeTibs = _.map(activeTibs, x => {
  //     return { targetId: existing.id, tibId: x };
  //   });
  //   // delete all true_tibs for target
  //   await context.sq.delete.from`target_true_tibs`.where({
  //     targetId: existing.id
  //   });
  //   // write trues
  //   await context.sq`target_true_tibs`.insert(writeTibs);
  // }

  // check condition where activeTibs was only edit.
  // if (activeTibs.length > 0 && _.keys(writeInput).length == 0) {
  //   return {
  //     success: true,
  //     code: "OK",
  //     message: "Target updated.",
  //     item: existing
  //   };
  // }

  // proceed to update target object
  const target = await updateOneHOR(
    "dataSource.target.update",
    "input",
    "id",
    "UPDATE_TARGET"
  )(root, writeArgs, context);

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
  } else {
    console.log("Can't enqueue job", {
      addressData,
      queue: context.workerQueues
    });
  }

  return {
    success: true,
    code: "OK",
    message: "Target updated.",
    item: target
  };
};
