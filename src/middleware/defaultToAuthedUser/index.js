import defaultToAuthedUser from "./defaultToAuthedUser";

export default {
  Mutation: {
    updateUser: defaultToAuthedUser
  }
};
