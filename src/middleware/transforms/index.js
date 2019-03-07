import lowerCaseEmailMW from "./lowerCaseEmail";
import createSlug from "./createSlug";

export default {
  Mutation: {
    createUser: lowerCaseEmailMW,
    updateUser: lowerCaseEmailMW,
    register: lowerCaseEmailMW,
    requestLogin: lowerCaseEmailMW,
    createClient: createSlug
  },
  Query: {
    user: lowerCaseEmailMW
  }
};
