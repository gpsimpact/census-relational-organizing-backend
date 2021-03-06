// import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestGlobalPerm
} from "../utils/createTestEntities";

const GET_ALL_TEAMS_QUERY = `
query teams($input:TeamsInput) {
    teams(input:$input) {
        hasMore
        totalCount
        items {
            id
            name
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

describe("Teams", () => {
  test("Happy Path", async () => {
    await createTestTeam();
    await createTestTeam();
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_TEAMS");

    // no input
    const response1 = await graphqlTestCall(
      GET_ALL_TEAMS_QUERY,
      {},
      { user: { id: user.id } }
    );
    // where only input
    const response2 = await graphqlTestCall(
      GET_ALL_TEAMS_QUERY,
      {
        input: { where: { name: { neq: "fdsfdsa" } } }
      },
      { user: { id: user.id } }
    );
    // pagination only no where
    const response3 = await graphqlTestCall(
      GET_ALL_TEAMS_QUERY,
      {
        input: { limit: 100, offset: 0 }
      },
      { user: { id: user.id } }
    );
    // partial pagination only 1
    const response4 = await graphqlTestCall(
      GET_ALL_TEAMS_QUERY,
      {
        input: { limit: 100 }
      },
      { user: { id: user.id } }
    );
    // partial pagination only 2
    const response5 = await graphqlTestCall(
      GET_ALL_TEAMS_QUERY,
      {
        input: { offset: 0 }
      },
      { user: { id: user.id } }
    );
    // should all be equal
    expect(response1).toEqual(response2);
    expect(response1).toEqual(response3);
    expect(response1).toEqual(response4);
    expect(response1).toEqual(response5);
    // should return correct data
    expect(response1.data.teams.hasMore).toBeFalsy();
    expect(response1.data.teams.totalCount).toBe(2);
    expect(response1.data.teams.items.length).toBe(2);
  });

  test("Happy Path - Sort by name", async () => {
    await createTestTeam();
    await createTestTeam();
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_TEAMS");

    // no input
    const responseASC = await graphqlTestCall(
      GET_ALL_TEAMS_QUERY,
      { input: { sort: { name: "ASC" } } },
      { user: { id: user.id } }
    );

    // should return correct data
    expect(responseASC.data.teams.hasMore).toBeFalsy();
    expect(responseASC.data.teams.totalCount).toBe(2);
    expect(responseASC.data.teams.items.length).toBe(2);
    expect(
      responseASC.data.teams.items[0].name <
        responseASC.data.teams.items[1].name
    ).toBe(true);

    // no input
    const responseDESC = await graphqlTestCall(
      GET_ALL_TEAMS_QUERY,
      { input: { sort: { name: "DESC" } } },
      { user: { id: user.id } }
    );

    // should return correct data
    expect(
      responseDESC.data.teams.items[0].name >
        responseDESC.data.teams.items[1].name
    ).toBe(true);
  });

  // test("Fails without ADMIN_TEAMS global perm", async () => {
  //   const user = await createTestUser();
  //   // no input
  //   const response = await graphqlTestCall(GET_ALL_TEAMS_QUERY, {}, user.id);
  //   // should return correct data
  //   expect(response.errors.length).toEqual(1);
  //   expect(response.errors[0].message).toEqual("Not Authorized!");
  // });

  test("Boolean Where", async () => {
    await createTestTeam();
    await createTestTeam(false);
    const user = await createTestUser();
    await createTestGlobalPerm(user.id, "ADMIN_TEAMS");

    const response = await graphqlTestCall(
      GET_ALL_TEAMS_QUERY,
      {
        input: { where: { active: { eq: true } } }
      },
      { user: { id: user.id } }
    );
    expect(response.data.teams.items.length).toBe(1);
  });

  // I think we can dissapear this. Was replaced with teamUsers top level query.
  // test("nested advanced join query filter", async () => {
  //   const team = await createTestTeam();
  //   await createTestTeam();
  //   const user = await createTestUser();
  //   await createTestGlobalPerm(user.id, "ADMIN_TEAMS");
  //   await createTesTeamPermission(user.id, team.id, "ALPHA");
  //   await createTesTeamPermission(user.id, team.id, "BETA");
  //   await createTesTeamPermission(user.id, team.id, "CHARLIE");

  //   const response = await graphqlTestCall(
  //     GET_ALL_TEAMS_QUERY,
  //     {
  //       input: {
  //         where: {
  //           active: { eq: true },
  //           teamPermissions: {
  //             permission: { in: ["BETA", "CHARLIE"] }
  //           }
  //         }
  //       }
  //     },
  //     { user: { id: user.id } }
  //   );
  //   // console.log(response);
  //   expect(response.data.teams.items.length).toBe(1);
  //   expect(response.data.teams.items[0].id).toEqual(team.id);
  // });

  // temporarily disable this test because I have no known need for exists filter yet.
  // test("Exists Teams", async () => {
  //   const team = await createTestTeam();
  //   await createTestTeam();
  //   const user = await createTestUser();
  //   await createTestGlobalPerm(user.id, "ADMIN_TEAMS");

  //   const response = await graphqlTestCall(
  //     GET_ALL_TEAMS_QUERY,
  //     {
  //       input: {
  //         where: {
  //           active: { eq: true },
  //           cycles: {
  //             category: {
  //               in: ["FEDERAL_SENATE", "STATE_LEGISLATURE"]
  //             },
  //             engagementDates: { containsDate: "2018-03-05" }
  //           }
  //         }
  //       }
  //     },
  //     user.id
  //   );
  //   console.log(response);
  //   expect(response.data.teams.items.length).toBe(1);
  //   expect(response.data.teams.items[0].id).toEqual(team.id);
  // });
});
