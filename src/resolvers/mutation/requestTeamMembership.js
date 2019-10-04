import {
  permsToInt,
  intToPerms,
  makeDefaultState
} from "../../utils/permissions/permBitWise";

export default async (root, args, context) => {
  const userId = context.user.id;

  // using compound loader to check.
  const existing = await context.dataSource.teamPermission.loadOne.load({
    userId,
    teamId: args.teamId
  });

  let permSeed = makeDefaultState();

  if (existing) {
    // consosle.log("???? here");
    permSeed = Object.assign({}, permSeed, intToPerms(existing.permission));
  }

  // console.log({ existing, permSeed });

  if (permSeed.APPLICANT === true) {
    return {
      success: false,
      code: "DUPLICATE",
      message: "An application for membership is already pending."
    };
  }

  if (existing && existing.permission > 0) {
    return {
      success: false,
      code: "INELIGIBLE",
      message: "You are ineligible to apply for membership."
    };
  }
  // }

  // set bit
  permSeed.APPLICANT = true;

  // if (existing) {
  //   await context.dataSource.teamPermission.update({
  //     userId,
  //     teamId: args.teamId,
  //     permission: permsToInt(permSeed)
  //   });
  // } else {
  await context.dataSource.teamPermission.create({
    userId,
    teamId: args.teamId,
    permission: permsToInt(permSeed)
  });
  // }

  return {
    success: true,
    code: "OK",
    message: "Application Successful."
  };
};
