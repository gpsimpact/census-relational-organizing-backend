// import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestTeam,
  createTestUser,
  createTestGlobalPerm
} from "../utils/createTestEntities";

const SUMMARY_COUNT_ALL_TEAMS_QUERY = `
    {
      summaryCountTeams
    }
`;

beforeEach(async () => {
  await dbUp();
});

describe("Summary Count all teams", () => {
  test("Fails without ADMIN_TEAMS global perm", async () => {
    const user = await createTestUser();
    const response = await graphqlTestCall(
      SUMMARY_COUNT_ALL_TEAMS_QUERY,
      null,
      user.id
    );
    // should return correct data
    // console.log(response);
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
  test("Happy Path", async () => {
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_TEAMS");
    // create 5 test teams
    await createTestTeam();
    await createTestTeam();
    await createTestTeam();
    await createTestTeam();
    await createTestTeam();
    const response = await graphqlTestCall(
      SUMMARY_COUNT_ALL_TEAMS_QUERY,
      null,
      user.id
    );
    // console.log(response);
    expect(response.data.summaryCountTeams).toEqual(5);
  });
});
