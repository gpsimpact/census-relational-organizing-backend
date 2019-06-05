// import faker from "faker";
import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestTeam,
  createAdminUser,
  createTestTarget
} from "../utils/createTestEntities";

const SUMMARY_COUNT_USER_TEAM_HH_QUERY = `
query summaryTotalMyTeamHouseholdSize($teamId: String!) {
  summaryTotalMyTeamHouseholdSize(teamId: $teamId)
}
`;

beforeEach(async () => {
  await dbUp();
});

describe("Summary Count team HH size - one user", () => {
  test("Happy Path", async () => {
    const user = await createAdminUser();
    const team = await createTestTeam();
    const t1 = await createTestTarget({ userId: user.id, teamId: team.id });
    const t2 = await createTestTarget({ userId: user.id, teamId: team.id });
    const t3 = await createTestTarget({ userId: user.id, teamId: team.id });
    const t4 = await createTestTarget({ userId: user.id, teamId: team.id });
    const t5 = await createTestTarget({ userId: user.id, teamId: team.id });

    const expectedTotalHHsize = _.reduce(
      [t1, t2, t3, t4, t5],
      (sum, x) => sum + parseInt(x.householdSize, 10),
      0
    );

    const response = await graphqlTestCall(
      SUMMARY_COUNT_USER_TEAM_HH_QUERY,
      { teamId: team.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.summaryTotalMyTeamHouseholdSize).toEqual(
      expectedTotalHHsize
    );
  });
});
