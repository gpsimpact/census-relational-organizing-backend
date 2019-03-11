import lowerCaseEmailMW from "./lowerCaseEmail";
import createSlug from "./createSlug";

export default {
  Mutation: {
    createUser: lowerCaseEmailMW,
    updateUser: lowerCaseEmailMW,
    register: lowerCaseEmailMW,
    requestLogin: lowerCaseEmailMW,
    createTeam: createSlug
  },
  Query: {
    user: lowerCaseEmailMW
  }
};
