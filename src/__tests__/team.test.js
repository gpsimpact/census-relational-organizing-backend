import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestGlobalPerm,
  createTestOLPermission
} from "../utils/createTestEntities";

const GET_TEAM_QUERY = `
query team($id: String, $slug: String) {
    team(id:$id, slug:$slug) {
        id
        name
        slug
        userPermissions {
          user {
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

describe("Team", () => {
  test("Happy Path By ID", async () => {
    const team = await createTestTeam();
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_TEAMS");
    const response = await graphqlTestCall(
      GET_TEAM_QUERY,
      {
        id: team.id
      },
      user.id
    );
    // should return correct data
    expect(response.data.team.id).toEqual(team.id);
    expect(response.data.team.name).toEqual(team.name);
  });

  test("Happy Path By Slug", async () => {
    const team = await createTestTeam();
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_TEAMS");
    const response = await graphqlTestCall(
      GET_TEAM_QUERY,
      {
        slug: team.slug
      },
      user.id
    );
    // should return correct data
    expect(response.data.team.id).toEqual(team.id);
    expect(response.data.team.name).toEqual(team.name);
    expect(response.data.team.slug).toEqual(team.slug);
  });

  test("returns null if neither slug nor id", async () => {
    await createTestTeam();
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_TEAMS");
    const response = await graphqlTestCall(GET_TEAM_QUERY, {}, user.id);
    // should return correct data
    expect(response.data.team).toBeNull();
  });

  // test("Fails without ADMIN_TEAMS global perm", async () => {
  //   const team = await createTestTeam();
  //   const user = await createTestUser();
  //   // no input
  //   const response = await graphqlTestCall(
  //     GET_TEAM_QUERY,
  //     {
  //       id: team.id
  //     },
  //     user.id
  //   );
  //   // console.log(response);
  //   // should return correct data
  //   expect(response.data.team).toBeNull();
  //   expect(response.errors.length).toEqual(1);
  //   expect(response.errors[0].message).toEqual("Not Authorized!");
  // });

  test("UserPermissions null", async () => {
    const team = await createTestTeam();
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_TEAMS");

    const response = await graphqlTestCall(
      GET_TEAM_QUERY,
      {
        id: team.id
      },
      user.id
    );

    expect(response.data.team.userPermissions).toBeNull();
  });

  test("UserPermissions not null", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestGlobalPerm(user.id, "ADMIN_TEAMS");

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

    const response = await graphqlTestCall(
      GET_TEAM_QUERY,
      {
        id: team.id
      },
      user.id
    );
    expect(response.data.team.userPermissions.length).toBe(1);
    expect(response.data.team.userPermissions[0].permissions.length).toBe(2);
    expect(response.data.team.userPermissions[0].permissions).toContain(
      cp1.permission
    );
    expect(response.data.team.userPermissions[0].permissions).toContain(
      cp2.permission
    );
    expect(response.data.team.userPermissions[0].user.id).toEqual(user.id);
  });
});
