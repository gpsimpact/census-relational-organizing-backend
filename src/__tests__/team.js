import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestGlobalPerm,
  createTestTeamPermission
} from "../utils/createTestEntities";

const GET_TEAM_QUERY = `
query team($id: String, $slug: String) {
    team(id:$id, slug:$slug) {
        id
        name
        slug    
        userPermissionSummaryCounts {
          permission
          count
        }
        tos
    }
}
`;

// extracted from query. Depreciated.
// userPermissions {
//   user {
//     id
//   }
//   permissions
// }

beforeEach(async () => {
  await dbUp();
});

afterAll(async () => {
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
      { user: { id: user.id } }
    );
    // should return correct data
    expect(response.data.team.id).toEqual(team.id);
    expect(response.data.team.name).toEqual(team.name);
    expect(response.data.team.tos).toEqual(team.tos);
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
      { user: { id: user.id } }
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

  // test("UserPermissions null", async () => {
  //   const team = await createTestTeam();
  //   const user = await createTestUser();
  //   await createTestGlobalPerm(user.id, "ADMIN_TEAMS");

  //   const response = await graphqlTestCall(
  //     GET_TEAM_QUERY,
  //     {
  //       id: team.id
  //     },
  //     { user: { id: user.id } }
  //   );

  //   expect(response.data.team.userPermissions).toBeNull();
  // });

  // test("UserPermissions not null", async () => {
  //   const adminUser = await createAdminUser();
  //   const team = await createTestTeam();

  //   const cp1 = await createTestTeamPermission(adminUser.id, team.id, "MEMBER");
  //   const cp2 = await createTestTeamPermission(
  //     adminUser.id,
  //     team.id,
  //     "APPLICANT"
  //   );

  //   const response = await graphqlTestCall(
  //     GET_TEAM_QUERY,
  //     {
  //       id: team.id
  //     },
  //     { user: { id: adminUser.id } }
  //   );
  //   // console.log(JSON.stringify(response, null, "\t"));
  //   expect(response.data.team.userPermissions.length).toBe(1);
  //   expect(response.data.team.userPermissions[0].permissions.length).toBe(2);
  //   expect(response.data.team.userPermissions[0].permissions).toContain(
  //     cp1.permission
  //   );
  //   expect(response.data.team.userPermissions[0].permissions).toContain(
  //     cp2.permission
  //   );
  //   expect(response.data.team.userPermissions[0].user.id).toEqual(adminUser.id);
  // });

  test("UserPermissions Summary", async () => {
    const adminUser = await createTestUser();
    const user2 = await createTestUser();
    const user3 = await createTestUser();
    const user4 = await createTestUser();
    const user5 = await createTestUser();
    const user6 = await createTestUser();

    const team = await createTestTeam();
    await createTestGlobalPerm(adminUser.id, "ADMIN_TEAMS");

    await createTestTeamPermission(user2.id, team.id, "MEMBER");
    await createTestTeamPermission(user3.id, team.id, "MEMBER");
    await createTestTeamPermission(user4.id, team.id, "ADMIN");
    await createTestTeamPermission(user5.id, team.id, "ADMIN");
    await createTestTeamPermission(user6.id, team.id, "ADMIN");

    const response = await graphqlTestCall(
      GET_TEAM_QUERY,
      {
        id: team.id
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.team.userPermissionSummaryCounts.length).toBe(6);
    expect(response.data.team.userPermissionSummaryCounts).toEqual([
      {
        permission: "APPLICANT",
        count: 0
      },
      {
        permission: "TRAINING",
        count: 0
      },
      {
        permission: "ELEVATED",
        count: 0
      },
      {
        permission: "MEMBER",
        count: 2
      },
      {
        permission: "ADMIN",
        count: 3
      },
      {
        permission: "DENIED",
        count: 0
      }
    ]);
  });
});
