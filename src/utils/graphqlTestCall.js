import { graphql } from "graphql";
import { makeExecutableSchema } from "graphql-tools";
import { applyMiddleware } from "graphql-middleware";
import lowerCaseEmailMW from "../middleware/lowerCaseEmail";
import createSlugMW from "../middleware/createSlug";
import defaultToAuthedUserMW from "../middleware/defaultToAuthedUser";
import permissionsMiddleware from "../middleware/permissions";

import makeContext from "../context";
import { default as typeDefs } from "../typeDefinitions";
import resolvers from "../resolvers";

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

const schemaWithMiddleware = applyMiddleware(
  schema,
  defaultToAuthedUserMW,
  permissionsMiddleware,
  lowerCaseEmailMW,
  createSlugMW
);

export const makeTestContext = (userId, contextOverRides) => {
  const context = makeContext(
    {
      session: {
        userId,
        destroy: () => {}
      }
    },
    {
      clearCookie: () => {}
    }
  );
  const testContext = Object.assign(context, contextOverRides);
  return testContext;
};

export const graphqlTestCall = async (
  query,
  variables,
  userId,
  contextOverRides
) => {
  // const schema = await generateSchema();
  const testContext = makeTestContext(userId, contextOverRides);
  return graphql(
    schemaWithMiddleware,
    query,
    undefined,
    testContext,
    variables
  );
};
