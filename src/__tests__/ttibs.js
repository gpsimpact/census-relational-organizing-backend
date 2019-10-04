import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTtib,
  createTestTeam,
  createTestTeamPermissionBit
} from "../utils/createTestEntities";
import { sq } from "../db";

const GET_ALL_TTIBS_QUERY = `
query Ttibs($input: TtibsInput!) {
    ttibs(input: $input) {
        id
        text
        createdAt
        updatedAt
        active
        visible
        tibType
    }
}
`;

beforeEach(async () => {
  await dbUp();
});

describe("TTIBS", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermissionBit(user.id, team.id, { MEMBER: true });
    await createTestTtib(user.id, team.id);
    await createTestTtib(user.id, team.id);
    const ttib3 = await createTestTtib(user.id, team.id);

    // create one in a second team just to verify it is not pulled in
    const team2 = await createTestTeam();
    await createTestTtib(user.id, team2.id);

    // no input
    const response = await graphqlTestCall(
      GET_ALL_TTIBS_QUERY,
      {
        input: {
          teamId: team.id,
          active: true,
          tibType: "QUESTION"
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.ttibs.length).toBe(3);

    await sq`tibs`.set({ active: false }).where({ id: ttib3.id });

    const response2 = await graphqlTestCall(
      GET_ALL_TTIBS_QUERY,
      {
        input: {
          teamId: team.id,
          active: true,
          tibType: "QUESTION"
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response2);
    // where only input
    expect(response2.data.ttibs.length).toBe(2);
  });

  test("Can grab only ACTION tibtypes", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermissionBit(user.id, team.id, { MEMBER: true });
    await createTestTtib(user.id, team.id);
    await createTestTtib(user.id, team.id);
    const ttib3 = await createTestTtib(user.id, team.id);
    // set one as action
    await sq`tibs`.set({ tibType: "ACTION" }).where({ id: ttib3.id });

    // no input
    const response = await graphqlTestCall(
      GET_ALL_TTIBS_QUERY,
      {
        input: {
          teamId: team.id,
          active: true,
          visible: true,
          tibType: "QUESTION"
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.ttibs.length).toBe(2);

    const response2 = await graphqlTestCall(
      GET_ALL_TTIBS_QUERY,
      {
        input: {
          teamId: team.id,
          tibType: "ACTION",
          active: true,
          visible: true
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response2);
    // where only input
    expect(response2.data.ttibs.length).toBe(1);
    expect(response2.data.ttibs[0].id).toBe(ttib3.id);
  });
});
