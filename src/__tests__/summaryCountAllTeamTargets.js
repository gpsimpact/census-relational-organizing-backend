// import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestTeam,
  createAdminUser,
  createTestTarget,
  createTestUser
} from "../utils/createTestEntities";

const SUMMARY_COUNT_USER_TARGET_QUERY = `
query summaryCountAllTeamTargets($teamId: String!) {
  summaryCountAllTeamTargets(teamId: $teamId)
}
`;

beforeEach(async () => {
  await dbUp();
});

afterAll(async () => {
  await dbDown();
});

describe("Summary Count orgs targets regardless of user", () => {
  test("Happy Path", async () => {
    const user = await createAdminUser();
    const user2 = await createAdminUser();
    const team = await createTestTeam();
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user2.id, teamId: team.id });

    const response = await graphqlTestCall(
      SUMMARY_COUNT_USER_TARGET_QUERY,
      { teamId: team.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.summaryCountAllTeamTargets).toEqual(6);
  });

  // Must be team admin or app admin
  test("PermCheck no team admin", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user2.id, teamId: team.id });

    // no input
    const response1 = await graphqlTestCall(
      SUMMARY_COUNT_USER_TARGET_QUERY,
      { teamId: team.id },
      { user: { id: user.id } }
    );
    debugResponse(response1);
    expect(response1.data).toBeNull();
    expect(response1.errors.length).toEqual(1);
    expect(response1.errors[0].message).toEqual("Not Authorized!");
  });
});
