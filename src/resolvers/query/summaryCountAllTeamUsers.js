import { sq } from "../../db";

export default async (root, args) => {
  const result = await sq.from`team_permissions`.return`count(*)`
    .where({ teamId: args.teamId })
    .where({ permission: ["ADMIN", "MEMBER"] })
    .one();
  return result.count;
};
