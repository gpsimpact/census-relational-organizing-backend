import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTtib,
  createTestTeam
} from "../utils/createTestEntities";
import { sq } from "../db";

const GET_ALL_TTIBS_QUERY = `
query Ttibs($teamId: String!, $visible: Boolean) {
    ttibs(teamId: $teamId, visible: $visible) {
        id
        text
        createdAt
        updatedAt
        active
        visible
        gtibLink
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
    await createTestTtib(user.id, team.id);
    await createTestTtib(user.id, team.id);
    const ttib3 = await createTestTtib(user.id, team.id);

    // create one in a second team just to verify it is not pulled in
    const team2 = await createTestTeam();
    await createTestTtib(user.id, team2.id);

    // no input
    const response = await graphqlTestCall(GET_ALL_TTIBS_QUERY, {
      teamId: team.id
    });
    expect(response.data.ttibs.length).toBe(3);

    await sq`ttibs`.set({ visible: false }).where({ id: ttib3.id });

    const response2 = await graphqlTestCall(GET_ALL_TTIBS_QUERY, {
      teamId: team.id
    });
    // where only input
    expect(response2.data.ttibs.length).toBe(2);
  });
});
