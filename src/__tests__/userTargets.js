// import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestTarget,
  createTestOLPermission
} from "../utils/createTestEntities";

const GET_ALL_USER_TARGETS_QUERY = `
query userTargets($teamId: String!, $input:TargetsInput) {
    userTargets(teamId: $teamId, input:$input) {
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

describe("User Targetss", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user2.id, teamId: team.id });
    await createTestOLPermission(user.id, team.id, "MEMBER");

    // no input
    const response1 = await graphqlTestCall(
      GET_ALL_USER_TARGETS_QUERY,
      { teamId: team.id },
      { user: { id: user.id } }
    );
    debugResponse(response1);
    // console.log(response1);
    // where only input
    const response2 = await graphqlTestCall(
      GET_ALL_USER_TARGETS_QUERY,
      {
        teamId: team.id,
        input: { where: { firstName: { neq: "fdsfdsa" } } }
      },
      { user: { id: user.id } }
    );
    // pagination only no where
    const response3 = await graphqlTestCall(
      GET_ALL_USER_TARGETS_QUERY,
      {
        teamId: team.id,
        input: { limit: 100, offset: 0 }
      },
      { user: { id: user.id } }
    );
    // partial pagination only 1
    const response4 = await graphqlTestCall(
      GET_ALL_USER_TARGETS_QUERY,
      {
        teamId: team.id,
        input: { limit: 100 }
      },
      { user: { id: user.id } }
    );
    // partial pagination only 2
    const response5 = await graphqlTestCall(
      GET_ALL_USER_TARGETS_QUERY,
      {
        teamId: team.id,
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
    expect(response1.data.userTargets.hasMore).toBeFalsy();
    expect(response1.data.userTargets.totalCount).toBe(2);
    expect(response1.data.userTargets.items.length).toBe(2);
  });

  test("PermCheck no team member", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user2.id, teamId: team.id });
    // await createTestOLPermission(user.id, team.id, "MEMBER");

    // no input
    const response1 = await graphqlTestCall(
      GET_ALL_USER_TARGETS_QUERY,
      { teamId: team.id },
      { user: { id: user.id } }
    );
    debugResponse(response1);
    expect(response1.data).toBeNull();
    expect(response1.errors.length).toEqual(1);
    expect(response1.errors[0].message).toEqual("Not Authorized!");
  });
});
