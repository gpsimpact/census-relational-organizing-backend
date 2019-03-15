import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestGlobalPerm,
  createTestTeam,
  createTestOLPermission
} from "../utils/createTestEntities";

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
        }
    }
}
`;

beforeEach(async () => {
  await dbUp();
});

afterEach(async () => {
  await dbDown();
});

describe("User", () => {
  test("Happy Path By Id", async () => {
    const user = await createTestUser();
    const response = await graphqlTestCall(GET_USER_QUERY, { id: user.id });
    expect(response.data.user.id).toEqual(user.id);
    expect(response.data.user.name).toEqual(user.name);
  });

  test("Happy Path by email", async () => {
    const user = await createTestUser({
      email: faker.internet.email().toLowerCase()
    });
    const response = await graphqlTestCall(GET_USER_QUERY, {
      email: user.email
    });
    expect(response.data.user.id).toEqual(user.id);
    expect(response.data.user.name).toEqual(user.name);
    expect(response.data.user.email).toEqual(user.email);
  });

  test("Happy Path by email with case coercion", async () => {
    const user = await createTestUser({
      email: faker.internet.email().toLowerCase()
    });
    const response = await graphqlTestCall(GET_USER_QUERY, {
      email: user.email.toUpperCase()
    });
    expect(response.data.user.id).toEqual(user.id);
    expect(response.data.user.name).toEqual(user.name);
    expect(response.data.user.email).toEqual(user.email);
  });

  test("Global Permissions NOT NULL", async () => {
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_TEAMS");
    await createTestGlobalPerm(user.id, "ADMIN");
    const response = await graphqlTestCall(GET_USER_QUERY, { id: user.id });
    // should return correct data
    expect(response.data.user.globalPermissions.sort()).toEqual(
      ["ADMIN_TEAMS", "ADMIN"].sort()
    );
  });

  test("Global Permissions NULL", async () => {
    const user = await createTestUser();
    const response = await graphqlTestCall(GET_USER_QUERY, { id: user.id });
    expect(response.data.user.globalPermissions).toEqual([]);
  });

  test("Team Permissions NOT null", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();

    const cp1 = await createTestOLPermission(
      user.id,
      team.id,
      "USER__READ__TEAM"
    );
    const cp2 = await createTestOLPermission(
      user.id,
      team.id,
      "USER__READ__TEAM_CONTACT_EMAIL"
    );

    const response = await graphqlTestCall(GET_USER_QUERY, { id: user.id });
    // console.log(response.data.user.teamPermissions);
    expect(response.data.user.teamPermissions.length).toBe(1);
    expect(response.data.user.teamPermissions[0].permissions.length).toBe(2);
    expect(response.data.user.teamPermissions[0].permissions).toContain(
      cp1.permission
    );
    expect(response.data.user.teamPermissions[0].permissions).toContain(
      cp2.permission
    );
    expect(response.data.user.teamPermissions[0].team.id).toEqual(team.id);
  });

  test("Team Permissions null", async () => {
    const user = await createTestUser();

    const response1 = await graphqlTestCall(GET_USER_QUERY, { id: user.id });

    // should return correct data
    expect(response1.data.user.teamPermissions).toBeNull();
  });

  test("Team Permissions NO LEAKS", async () => {
    const user1 = await createTestUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();

    await createTestOLPermission(user1.id, team.id, "USER__READ__TEAM");

    await createTestOLPermission(
      user1.id,
      team.id,
      "USER__READ__TEAM_CONTACT_EMAIL"
    );

    const response1 = await graphqlTestCall(GET_USER_QUERY, { id: user2.id });
    // should return correct data
    expect(response1.data.user.teamPermissions).toBeNull();
  });

  test("Team Permissions NO inactive Teams", async () => {
    const user = await createTestUser();
    const team = await createTestTeam(false);

    await createTestOLPermission(user.id, team.id, "USER__READ__TEAM");
    await createTestOLPermission(
      user.id,
      team.id,
      "USER__READ__TEAM_CONTACT_EMAIL"
    );

    const response = await graphqlTestCall(GET_USER_QUERY, { id: user.id });
    expect(response.data.user.teamPermissions).toBeNull();
  });
});
