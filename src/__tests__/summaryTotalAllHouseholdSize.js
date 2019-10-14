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

const SUMMARY_COUNT_ALL_HH_QUERY = `
query summaryTotalAllHouseholdSize {
  summaryTotalAllHouseholdSize
}
`;

beforeEach(async () => {
  await dbUp();
});

afterAll(async () => {
  await dbDown();
});

describe("Summary Count all HH size - all users, all teams", () => {
  test("Happy Path", async () => {
    const user = await createAdminUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();
    const team2 = await createTestTeam();
    const t1 = await createTestTarget({ userId: user.id, teamId: team.id });
    const t2 = await createTestTarget({ userId: user.id, teamId: team.id });
    const t3 = await createTestTarget({ userId: user.id, teamId: team.id });
    const t4 = await createTestTarget({ userId: user.id, teamId: team.id });
    const t5 = await createTestTarget({ userId: user.id, teamId: team2.id });
    const t6 = await createTestTarget({ userId: user2.id, teamId: team.id });

    const expectedTotalHHsize = _.reduce(
      [t1, t2, t3, t4, t5, t6],
      (sum, x) => sum + parseInt(x.householdSize, 10),
      0
    );

    const response = await graphqlTestCall(SUMMARY_COUNT_ALL_HH_QUERY, null, {
      user: { id: user.id }
    });
    debugResponse(response);
    expect(response.data.summaryTotalAllHouseholdSize).toEqual(
      expectedTotalHHsize
    );
  });

  // perm check
  test("Must be global admin.", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user2.id, teamId: team.id });

    const response = await graphqlTestCall(SUMMARY_COUNT_ALL_HH_QUERY, null, {
      user: { id: user.id }
    });
    debugResponse(response);
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("Zero bug", async () => {
    const user = await createAdminUser();

    const response = await graphqlTestCall(SUMMARY_COUNT_ALL_HH_QUERY, null, {
      user: { id: user.id }
    });
    debugResponse(response);
    expect(response.data.summaryTotalAllHouseholdSize).toEqual(0);
  });
});
