// import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestGlobalPerm,
  createTestTarget
} from "../utils/createTestEntities";

const GET_ALL_TARGETS_QUERY = `
query targets($input:TargetsInput) {
    targets(input:$input) {
        hasMore
        totalCount
        items {
            id
            firstName
            lastName
        }
    }
}
`;

beforeEach(async () => {
  await dbUp();
});

afterAll(async () => {
  await dbDown();
});

describe("Targets", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });

    await createTestGlobalPerm(user.id, "ADMIN");

    // no input
    const response1 = await graphqlTestCall(
      GET_ALL_TARGETS_QUERY,
      {},
      { user: { id: user.id } }
    );
    debugResponse(response1);
    // where only input
    const response2 = await graphqlTestCall(
      GET_ALL_TARGETS_QUERY,
      {
        input: { where: { firstName: { neq: "fdsfdsa" } } }
      },
      { user: { id: user.id } }
    );
    // pagination only no where
    const response3 = await graphqlTestCall(
      GET_ALL_TARGETS_QUERY,
      {
        input: { limit: 100, offset: 0 }
      },
      { user: { id: user.id } }
    );
    // partial pagination only 1
    const response4 = await graphqlTestCall(
      GET_ALL_TARGETS_QUERY,
      {
        input: { limit: 100 }
      },
      { user: { id: user.id } }
    );
    // partial pagination only 2
    const response5 = await graphqlTestCall(
      GET_ALL_TARGETS_QUERY,
      {
        input: { offset: 0 }
      },
      { user: { id: user.id } }
    );
    // should all be equal
    expect(response1).toEqual(response2);
    expect(response1).toEqual(response3);
    expect(response1).toEqual(response4);
    expect(response1).toEqual(response5);
    // should return correct data
    expect(response1.data.targets.hasMore).toBeFalsy();
    expect(response1.data.targets.totalCount).toBe(3);
    expect(response1.data.targets.items.length).toBe(3);
  });
});
