import defaultToAuthedUser from "./defaultToAuthedUser";

const byRootId = defaultToAuthedUser("id");
const byRootUserId = defaultToAuthedUser("userId");

export default {
  Mutation: {
    updateUser: byRootId
  },
  Query: {
    userTargets: byRootUserId
  }
};
