import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestGtib,
  createTestTtib
} from "../utils/createTestEntities";
import { sq } from "../db";

const APPLY_GTIB_MUTATION = `
    mutation applyGtib($input: ApplyGtibInput!) {
      applyGtib(input: $input) {
            code
            message
            success
            item {
                id
                text
                userId
                createdAt
                updatedAt
                gtibLink
                active
                visible
            }
        }
    }
`;

beforeEach(async () => {
  await dbUp();
});

describe("Apply GTIB", () => {
  test("happy path", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const gtib = await createTestGtib(user.id);

    const input = {
      teamId: team.id,
      gtibId: gtib.id
    };

    const response = await graphqlTestCall(
      APPLY_GTIB_MUTATION,
      {
        input
      },
      { user: { id: user.id } }
    );
    expect(response.data.applyGtib.code).toBe("OK");
    expect(response.data.applyGtib.message).toBe("GTIB has been applied.");
    expect(response.data.applyGtib.success).toBe(true);
    expect(response.data.applyGtib.item.userId).toBe(user.id);
    expect(response.data.applyGtib.item.text).toBe(gtib.text);
    expect(response.data.applyGtib.item.gtibLink).toBe(gtib.id);
    const [dbTTIB] = await sq.from`ttibs`.where({
      id: response.data.applyGtib.item.id
    });
    expect(dbTTIB).not.toBeNull();
    expect(dbTTIB.active).toBe(true);
    expect(dbTTIB.visible).toBe(true);
    expect(dbTTIB.userId).toBe(user.id);
    expect(dbTTIB.text).toBe(gtib.text);
    expect(dbTTIB.gtibLink).toBe(gtib.id);
  });

  test("will overwrite an existing ttib with gtibLink", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const gtib = await createTestGtib(user.id);
    const ttib = await createTestTtib(user.id, team.id);

    // set correct state of ttib
    await sq`ttibs`
      .set({
        active: false,
        visible: false,
        gtibLink: gtib.id,
        text: gtib.text
      })
      .where({ id: ttib.id });

    const input = {
      teamId: team.id,
      gtibId: gtib.id
    };

    const response = await graphqlTestCall(
      APPLY_GTIB_MUTATION,
      {
        input
      },
      { user: { id: user.id } }
    );
    expect(response.data.applyGtib.code).toBe("OK");
    expect(response.data.applyGtib.message).toBe(
      "This gtib has already been applied. It has been (re)set to visible/active."
    );
    expect(response.data.applyGtib.success).toBe(true);
    expect(response.data.applyGtib.item.userId).toBe(user.id);
    expect(response.data.applyGtib.item.text).toBe(gtib.text);
    expect(response.data.applyGtib.item.gtibLink).toBe(gtib.id);
    expect(response.data.applyGtib.item.active).toBe(true);
    expect(response.data.applyGtib.item.visible).toBe(true);
    const [dbTTIB] = await sq.from`ttibs`.where({
      id: response.data.applyGtib.item.id
    });
    expect(dbTTIB).not.toBeNull();
    expect(dbTTIB.active).toBe(true);
    expect(dbTTIB.visible).toBe(true);
    expect(dbTTIB.userId).toBe(user.id);
    expect(dbTTIB.text).toBe(gtib.text);
    expect(dbTTIB.gtibLink).toBe(gtib.id);
    expect(dbTTIB.active).toBe(true);
    expect(dbTTIB.visible).toBe(true);
  });
});
