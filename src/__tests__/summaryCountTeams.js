// import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestTeam,
  createTestUser,
  // createTestGlobalPerm,
  createAdminUser
} from "../utils/createTestEntities";

const SUMMARY_COUNT_ALL_TEAMS_QUERY = `
    {
      summaryCountTeams
    }
`;

beforeEach(async () => {
  await dbUp();
});

afterAll(async () => {
  await dbDown();
});

describe("Summary Count all teams", () => {
  test("Fails without ADMIN_TEAMS global perm", async () => {
    const user = await createTestUser();
    const response = await graphqlTestCall(
      SUMMARY_COUNT_ALL_TEAMS_QUERY,
      null,
      { user: { id: user.id } }
    );
    // should return correct data
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("Happy Path", async () => {
    const adminUser = await createAdminUser();

    // create 5 test teams
    await createTestTeam();
    await createTestTeam();
    await createTestTeam();
    await createTestTeam();
    await createTestTeam();
    const response = await graphqlTestCall(
      SUMMARY_COUNT_ALL_TEAMS_QUERY,
      null,
      { user: { id: adminUser.id } }
    );
    expect(response.data.summaryCountTeams).toEqual(5);
  });
});
