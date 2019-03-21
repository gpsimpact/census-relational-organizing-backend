import lowerCaseEmailMW from "./lowerCaseEmail";

export default {
  Mutation: {
    createUser: lowerCaseEmailMW,
    updateUser: lowerCaseEmailMW,
    register: lowerCaseEmailMW,
    requestLogin: lowerCaseEmailMW
  },
  Query: {
    user: lowerCaseEmailMW
  }
};
