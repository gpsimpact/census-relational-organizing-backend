// import faker from "faker";
import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestTeam,
  createAdminUser,
  createTestTarget,
  createTestUser
} from "../utils/createTestEntities";

const SUMMARY_COUNT_TEAM_HH_QUERY = `
query summaryTotalAllTeamHouseholdSize($teamId: String!) {
  summaryTotalAllTeamHouseholdSize(teamId: $teamId)
}
`;

beforeEach(async () => {
  await dbUp();
});

afterAll(async () => {
  await dbDown();
});

describe("Summary Count team HH size - all users", () => {
  test("Happy Path", async () => {
    const user = await createAdminUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();
    const t1 = await createTestTarget({ userId: user.id, teamId: team.id });
    const t2 = await createTestTarget({ userId: user.id, teamId: team.id });
    const t3 = await createTestTarget({ userId: user.id, teamId: team.id });
    const t4 = await createTestTarget({ userId: user.id, teamId: team.id });
    const t5 = await createTestTarget({ userId: user.id, teamId: team.id });
    const t6 = await createTestTarget({ userId: user2.id, teamId: team.id });

    const expectedTotalHHsize = _.reduce(
      [t1, t2, t3, t4, t5, t6],
      (sum, x) => sum + parseInt(x.householdSize, 10),
      0
    );

    const response = await graphqlTestCall(
      SUMMARY_COUNT_TEAM_HH_QUERY,
      { teamId: team.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.summaryTotalAllTeamHouseholdSize).toEqual(
      expectedTotalHHsize
    );
  });

  test("Happy Path, Null case", async () => {
    const user = await createAdminUser();
    const team = await createTestTeam();

    const response = await graphqlTestCall(
      SUMMARY_COUNT_TEAM_HH_QUERY,
      { teamId: team.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.summaryTotalAllTeamHouseholdSize).toEqual(0);
  });

  // perm check
  test("Must be team admin or global admin.", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user2.id, teamId: team.id });

    const response = await graphqlTestCall(
      SUMMARY_COUNT_TEAM_HH_QUERY,
      { teamId: team.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
