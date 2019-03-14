// import faker from "faker";
import { graphqlTestCall, makeTestContext } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import { createTestUser } from "../utils/createTestEntities";

const LOGOUT_MUTATION = `
    mutation {
      logout {
            code
            success
            message
            item {
              id
            }
        }
    }
`;

beforeEach(async () => {
  await dbUp();
});

afterEach(async () => {
  await dbDown();
});

describe("Logout", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();

    const context = makeTestContext(user.id);
    // context.req.session.destroy = jest.fn().mockImplementation(fn => fn(false));
    context.req.session.destroy = jest.fn(f => f());
    context.res.clearCookie = jest.fn();

    await graphqlTestCall(LOGOUT_MUTATION, null, null, context);
    expect(context.req.session.destroy).toHaveBeenCalled();
    expect(context.res.clearCookie).toHaveBeenCalledWith("qid");
  });
});
