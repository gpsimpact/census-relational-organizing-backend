import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createAdminUser,
  createTestTeam,
  createTestOLPermission
} from "../utils/createTestEntities";

const GET_ALL_USERS_QUERY = `
query teamUsers($input:TeamUsersInput!) {
  teamUsers(input:$input) {
        hasMore
        totalCount
        items {
            id
            firstName
            lastName
            address
            city
            state
            zip5
            phone
            email
            active
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

describe("Users", () => {
  test("Happy Path no where", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestOLPermission(user.id, team.id, "MEMBER");
    const adminUser = await createAdminUser();

    // no input
    const response = await graphqlTestCall(
      GET_ALL_USERS_QUERY,
      {
        input: { teamId: team.id, includePermissions: ["MEMBER", "ADMIN"] }
      },
      {
        user: { id: adminUser.id }
      }
    );
    debugResponse(response);
    // should return correct data
    expect(response.data.teamUsers.hasMore).toBeFalsy();
    expect(response.data.teamUsers.totalCount).toBe(1);
    expect(response.data.teamUsers.items.length).toBe(1);
  });

  test("Happy Path with where", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();
    await createTestOLPermission(user.id, team.id, "MEMBER");
    await createTestOLPermission(user2.id, team.id, "MEMBER");
    const adminUser = await createAdminUser();

    // no input
    const response = await graphqlTestCall(
      GET_ALL_USERS_QUERY,
      {
        input: {
          teamId: team.id,
          includePermissions: ["MEMBER", "ADMIN"],
          where: { email: { eq: user2.email } }
        }
      },
      {
        user: { id: adminUser.id }
      }
    );
    debugResponse(response);
    // should return correct data
    expect(response.data.teamUsers.hasMore).toBeFalsy();
    expect(response.data.teamUsers.totalCount).toBe(1);
    expect(response.data.teamUsers.items.length).toBe(1);
    expect(response.data.teamUsers.items[0].email).toBe(user2.email);
  });
});
