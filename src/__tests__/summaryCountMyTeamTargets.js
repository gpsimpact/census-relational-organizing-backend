// import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestTeam,
  createAdminUser,
  createTestTarget
} from "../utils/createTestEntities";

const SUMMARY_COUNT_USER_TARGET_QUERY = `
query summaryCountMyTeamTargets($teamId: String!) {
  summaryCountMyTeamTargets(teamId: $teamId)
}
`;

beforeEach(async () => {
  await dbUp();
});

describe("Summary Count orgs targets that user created", () => {
  test("Happy Path", async () => {
    const user = await createAdminUser();
    const team = await createTestTeam();
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });

    const response = await graphqlTestCall(
      SUMMARY_COUNT_USER_TARGET_QUERY,
      { teamId: team.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.summaryCountMyTeamTargets).toEqual(5);
  });
});
