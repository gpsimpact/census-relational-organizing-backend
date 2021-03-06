// import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestTarget,
  createTestTeamPermission
} from "../utils/createTestEntities";

const GET_ALL_USER_TARGETS_QUERY = `
query userTargets($teamId: String!, $userId:String, $input:TargetsInput) {
    userTargets(teamId: $teamId, userId:$userId, input:$input) {
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

describe("User Targets", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user2.id, teamId: team.id });
    // await createTestTeamPermission(user.id, team.id, "MEMBER");

    await createTestTeamPermission(user.id, team.id, "MEMBER");

    // no input
    const response1 = await graphqlTestCall(
      GET_ALL_USER_TARGETS_QUERY,
      { teamId: team.id },
      { user: { id: user.id } }
    );
    debugResponse(response1);
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
    // await createTestTeamPermission(user.id, team.id, "MEMBER");

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

  test("team admin can query for member user targets by specifying userId arg", async () => {
    const teamAdminUser = await createTestUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();
    await createTestTarget({ userId: user2.id, teamId: team.id });
    await createTestTarget({ userId: user2.id, teamId: team.id });

    await createTestTeamPermission(user2.id, team.id, "MEMBER");
    await createTestTeamPermission(teamAdminUser.id, team.id, "ADMIN");

    // AS TEAM ADMIN
    const response1 = await graphqlTestCall(
      GET_ALL_USER_TARGETS_QUERY,
      { teamId: team.id, userId: user2.id },
      { user: { id: teamAdminUser.id } }
    );
    debugResponse(response1);

    // AS USER
    const response2 = await graphqlTestCall(
      GET_ALL_USER_TARGETS_QUERY,
      { teamId: team.id },
      { user: { id: user2.id } }
    );
    debugResponse(response2);

    expect(response1).toEqual(response2);
  });

  test("non team admin CAN NOT query for member user targets by specifying userId arg", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();
    await createTestTarget({ userId: user2.id, teamId: team.id });
    await createTestTarget({ userId: user2.id, teamId: team.id });
    await createTestTeamPermission(user2.id, team.id, "MEMBER");
    await createTestTeamPermission(user1.id, team.id, "MEMBER");

    // AS TEAM ADMIN
    const response1 = await graphqlTestCall(
      GET_ALL_USER_TARGETS_QUERY,
      { teamId: team.id, userId: user2.id },
      { user: { id: user1.id } }
    );
    debugResponse(response1);

    // AS USER
    const response2 = await graphqlTestCall(
      GET_ALL_USER_TARGETS_QUERY,
      { teamId: team.id },
      { user: { id: user2.id } }
    );
    debugResponse(response2);

    expect(response1.data).toBeNull();
    expect(response1.errors.length).toEqual(1);
    expect(response1.errors[0].message).toEqual("Not Authorized!");
  });
});
