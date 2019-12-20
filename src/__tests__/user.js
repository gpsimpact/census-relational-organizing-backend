import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createAdminUser,
  createTestTeamPermission
} from "../utils/createTestEntities";
import { sq } from "../db";

const GET_USER_QUERY = `
query User($id: String, $email: String) {
    user(id: $id, email: $email) {
        id
        firstName
        lastName
        address
        city
        state
        zip5
        phone
        email
        globalPermissions
        teamPermissions {
          team {
            id
          }
          permissions
          acceptedTos
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

describe("User", () => {
  test("Happy Path By Id", async () => {
    const user = await createTestUser();
    const adminUser = await createAdminUser();
    const response = await graphqlTestCall(
      GET_USER_QUERY,
      { id: user.id },
      { user: { id: adminUser.id } }
    );
    expect(response.data.user.id).toEqual(user.id);
    expect(response.data.user.name).toEqual(user.name);
  });

  test("Happy Path by email", async () => {
    const adminUser = await createAdminUser();
    const user = await createTestUser({
      email: faker.internet.email().toLowerCase()
    });
    const response = await graphqlTestCall(
      GET_USER_QUERY,
      {
        email: user.email
      },
      { user: { id: adminUser.id } }
    );
    expect(response.data.user.id).toEqual(user.id);
    expect(response.data.user.name).toEqual(user.name);
    expect(response.data.user.email).toEqual(user.email);
  });

  test("Happy Path by email with case coercion", async () => {
    const adminUser = await createAdminUser();
    const user = await createTestUser({
      email: faker.internet.email().toLowerCase()
    });
    const response = await graphqlTestCall(
      GET_USER_QUERY,
      {
        email: user.email.toUpperCase()
      },
      { user: { id: adminUser.id } }
    );
    expect(response.data.user.id).toEqual(user.id);
    expect(response.data.user.name).toEqual(user.name);
    expect(response.data.user.email).toEqual(user.email);
  });

  test("Global Permissions NOT NULL", async () => {
    const adminUser = await createAdminUser();
    const response = await graphqlTestCall(
      GET_USER_QUERY,
      { id: adminUser.id },
      { user: { id: adminUser.id } }
    );
    // should return correct data
    expect(response.data.user.globalPermissions.sort()).toEqual(
      ["ADMIN"].sort()
    );
  });

  test("Global Permissions NULL", async () => {
    const adminUser = await createAdminUser();
    const user = await createTestUser();
    const response = await graphqlTestCall(
      GET_USER_QUERY,
      { id: user.id },
      { user: { id: adminUser.id } }
    );
    expect(response.data.user.globalPermissions).toEqual([]);
  });

  test("Team Permissions NOT null", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const adminUser = await createAdminUser();

    // const cp1 = await createTestTeamPermission(user.id, team.id, "MEMBER");
    // const cp2 = await createTestTeamPermission(user.id, team.id, "ADMIN");

    await createTestTeamPermission(user.id, team.id, "MEMBER");

    const response = await graphqlTestCall(
      GET_USER_QUERY,
      { id: user.id },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.user.teamPermissions.length).toBe(1);
    expect(response.data.user.teamPermissions[0].permissions.length).toBe(1);
    expect(response.data.user.teamPermissions[0].permissions).toContain(
      "MEMBER"
    );
    // expect(response.data.user.teamPermissions[0].permissions).toContain(
    //   "ADMIN"
    // );
    expect(response.data.user.teamPermissions[0].team.id).toEqual(team.id);
    expect(response.data.user.teamPermissions[0].acceptedTos).toEqual(false);
    await sq`team_permissions`
      .set({ acceptedTos: true })
      .where({ teamId: team.id, userId: user.id });
    const response2 = await graphqlTestCall(
      GET_USER_QUERY,
      { id: user.id },
      { user: { id: adminUser.id } }
    );
    debugResponse(response2);
    expect(response2.data.user.teamPermissions[0].acceptedTos).toEqual(true);
  });

  test("Team Permissions null", async () => {
    const user = await createTestUser();
    const adminUser = await createAdminUser();
    const response1 = await graphqlTestCall(
      GET_USER_QUERY,
      { id: user.id },
      { user: { id: adminUser.id } }
    );

    // should return correct data
    expect(response1.data.user.teamPermissions).toEqual([]);
  });

  test("Non admin user can not query another user", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();

    // await createTestTeamPermission(user1.id, team.id, "ADMIN");

    // await createTestTeamPermission(user1.id, team.id, "MEMBER");

    await createTestTeamPermission(user1.id, team.id, "MEMBER");

    const response = await graphqlTestCall(
      GET_USER_QUERY,
      { id: user2.id },
      { user: { id: user1.id } }
    );
    // should return correct data
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("Non admin user CAN query self", async () => {
    const user1 = await createTestUser();
    const team = await createTestTeam();

    // await createTestTeamPermission(user1.id, team.id, "ADMIN");

    // await createTestTeamPermission(user1.id, team.id, "MEMBER");

    await createTestTeamPermission(user1.id, team.id, "MEMBER");

    const response = await graphqlTestCall(
      GET_USER_QUERY,
      { id: user1.id },
      { user: { id: user1.id } }
    );
    // should return correct data
    expect(response.data.user.teamPermissions[0].team.id).toEqual(team.id);
    expect(response.data.user.teamPermissions.length).toEqual(1);
    expect(response.data.user.teamPermissions[0].permissions.length).toEqual(1);
  });

  test("Team Permissions NO inactive Teams", async () => {
    const user = await createTestUser();
    const team = await createTestTeam(false);

    await createTestTeamPermission(user.id, team.id, "MEMBER");

    const response = await graphqlTestCall(
      GET_USER_QUERY,
      { id: user.id },
      { user: { id: user.id } }
    );
    expect(response.data.user.teamPermissions).toEqual([]);
  });
});
