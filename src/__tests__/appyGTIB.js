import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestTeam,
  createTestGtib,
  createTestTtib,
  createAdminUser
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

afterEach(async () => {
  await dbDown();
});

describe("Apply GTIB", () => {
  test("happy path", async () => {
    const adminUser = await createAdminUser();

    const team = await createTestTeam();
    const gtib = await createTestGtib(adminUser.id);

    const input = {
      teamId: team.id,
      gtibId: gtib.id
    };

    const response = await graphqlTestCall(
      APPLY_GTIB_MUTATION,
      {
        input
      },
      { user: { id: adminUser.id } }
    );
    expect(response.data.applyGtib.code).toBe("OK");
    expect(response.data.applyGtib.message).toBe("GTIB has been applied.");
    expect(response.data.applyGtib.success).toBe(true);
    expect(response.data.applyGtib.item.userId).toBe(adminUser.id);
    expect(response.data.applyGtib.item.text).toBe(gtib.text);
    expect(response.data.applyGtib.item.gtibLink).toBe(gtib.id);
    const [dbTTIB] = await sq.from`ttibs`.where({
      id: response.data.applyGtib.item.id
    });
    expect(dbTTIB).not.toBeNull();
    expect(dbTTIB.active).toBe(true);
    expect(dbTTIB.visible).toBe(true);
    expect(dbTTIB.userId).toBe(adminUser.id);
    expect(dbTTIB.text).toBe(gtib.text);
    expect(dbTTIB.gtibLink).toBe(gtib.id);
  });

  test("will overwrite an existing ttib with gtibLink", async () => {
    const adminUser = await createAdminUser();
    const team = await createTestTeam();
    const gtib = await createTestGtib(adminUser.id);
    const ttib = await createTestTtib(adminUser.id, team.id);

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
      { user: { id: adminUser.id } }
    );
    expect(response.data.applyGtib.code).toBe("OK");
    expect(response.data.applyGtib.message).toBe(
      "This gtib has already been applied. It has been (re)set to visible/active."
    );
    expect(response.data.applyGtib.success).toBe(true);
    expect(response.data.applyGtib.item.userId).toBe(adminUser.id);
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
    expect(dbTTIB.userId).toBe(adminUser.id);
    expect(dbTTIB.text).toBe(gtib.text);
    expect(dbTTIB.gtibLink).toBe(gtib.id);
    expect(dbTTIB.active).toBe(true);
    expect(dbTTIB.visible).toBe(true);
  });
});
