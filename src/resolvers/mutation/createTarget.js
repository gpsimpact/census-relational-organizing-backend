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

  let activeTibs = [];
  // extract activeTibs from dbWrite
  if (writeInput.activeTibs) {
    activeTibs = activeTibs.concat(writeInput.activeTibs);
    writeInput = _.omit(writeInput, "activeTibs");
  }

  const writeArgs = Object.assign({}, args, { input: writeInput });

  const target = await addOneHOR(
    "dataSource.target.create",
    "input",
    "CREATE_TARGET"
  )(root, writeArgs, context);

  // now apply activeTibs
  if (activeTibs.length > 0) {
    const writeTibs = _.map(activeTibs, x => {
      return { targetId: target.id, ttibId: x };
    });

    await context.sq`target_true_tibs`.insert(writeTibs);
  }

  return {
    success: true,
    code: "OK",
    message: "Target created.",
    item: target
  };
};
