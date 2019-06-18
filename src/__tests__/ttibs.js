import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTtib,
  createTestTeam,
  createTestOLPermission
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
    await createTestOLPermission(user.id, team.id, "MEMBER");
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
        input: { teamId: team.id }
      },
      { user: { id: user.id } }
    );
    expect(response.data.ttibs.length).toBe(3);

    await sq`tibs`.set({ visible: false }).where({ id: ttib3.id });

    const response2 = await graphqlTestCall(
      GET_ALL_TTIBS_QUERY,
      {
        input: { teamId: team.id }
      },
      { user: { id: user.id } }
    );
    // where only input
    expect(response2.data.ttibs.length).toBe(2);
  });
});
