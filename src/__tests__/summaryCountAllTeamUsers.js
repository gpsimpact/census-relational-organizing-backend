// import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestTeam,
  createAdminUser,
  createTestUser,
  createTestTeamPermission
} from "../utils/createTestEntities";

const QUERY = `
query summaryCountAllTeamUsers($teamId: String!) {
  summaryCountAllTeamUsers(teamId: $teamId)
}
`;

beforeEach(async () => {
  await dbUp();
});

afterAll(async () => {
  await dbDown();
});

describe("Summary Count orgs users", () => {
  test("Happy Path", async () => {
    const adminUser = await createAdminUser();
    const user2 = await createTestUser();
    const user3 = await createTestUser();
    const user4 = await createTestUser();
    const user5 = await createTestUser();
    const team = await createTestTeam();
    const team2 = await createTestTeam();

    await createTestTeamPermission(adminUser.id, team.id, "ADMIN");
    await createTestTeamPermission(user2.id, team.id, "MEMBER");
    await createTestTeamPermission(user3.id, team.id, "MEMBER");
    await createTestTeamPermission(user4.id, team.id, "MEMBER");
    await createTestTeamPermission(user5.id, team2.id, "MEMBER"); // holdout

    const response = await graphqlTestCall(
      QUERY,
      { teamId: team.id },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.summaryCountAllTeamUsers).toEqual(4);
  });

  // Must be team admin or app admin
  test("PermCheck no team admin", async () => {
    const adminUser = await createAdminUser();
    const user2 = await createTestUser();
    const user3 = await createTestUser();
    const user4 = await createTestUser();
    const user5 = await createTestUser();
    const team = await createTestTeam();
    const team2 = await createTestTeam();

    await createTestTeamPermission(adminUser.id, team.id, "ADMIN");
    await createTestTeamPermission(user2.id, team.id, "MEMBER");
    await createTestTeamPermission(user3.id, team.id, "MEMBER");
    await createTestTeamPermission(user4.id, team.id, "MEMBER");
    await createTestTeamPermission(user5.id, team2.id, "MEMBER"); // holdout

    const response = await graphqlTestCall(
      QUERY,
      { teamId: team.id },
      { user: { id: user5.id } }
    );
    debugResponse(response);
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
