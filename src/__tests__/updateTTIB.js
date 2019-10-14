import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTtib,
  createTestTeam,
  createAdminUser,
  createTestTeamPermissionBit
} from "../utils/createTestEntities";
import { sq } from "../db";

const UPDATE_TTIB_MUTATION = `
    mutation updateTtib($id: String!, $input: UpdateTtibInput!) {
      updateTtib(id: $id, input: $input) {
            code
            message
            success
            item {
                id
                text
                userId
                createdAt
                updatedAt
                tibType
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

describe("UpdateTTib Resovler", () => {
  test("happy path as global admin", async () => {
    const user = await createTestUser();
    const adminUser = await createAdminUser();
    const team = await createTestTeam();
    const ttib = await createTestTtib(user.id, team.id);
    const updateData = {
      text: "I am text!"
    };

    const response = await graphqlTestCall(
      UPDATE_TTIB_MUTATION,
      {
        id: ttib.id,
        input: updateData
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.updateTtib.code).toBe("OK");
    expect(response.data.updateTtib.message).toBe("TTIB has been updated.");
    expect(response.data.updateTtib.success).toBe(true);
    expect(response.data.updateTtib.item.userId).toBe(adminUser.id);
    expect(response.data.updateTtib.item.text).toBe(updateData.text);
    const [dbTTIB] = await sq.from`tibs`.where({
      id: response.data.updateTtib.item.id
    });
    expect(dbTTIB).not.toBeNull();
    expect(dbTTIB.active).toBe(true);
    expect(dbTTIB.visible).toBe(true);
    expect(dbTTIB.userId).toBe(adminUser.id);
    expect(dbTTIB.text).toBe(updateData.text);
  });

  test("happy path as team admin", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermissionBit(user.id, team.id, { ADMIN: true });
    const ttib = await createTestTtib(user.id, team.id);
    const updateData = {
      text: "I am text!"
    };

    const response = await graphqlTestCall(
      UPDATE_TTIB_MUTATION,
      {
        id: ttib.id,
        input: updateData
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.updateTtib.code).toBe("OK");
    expect(response.data.updateTtib.message).toBe("TTIB has been updated.");
    expect(response.data.updateTtib.success).toBe(true);
    expect(response.data.updateTtib.item.userId).toBe(user.id);
    expect(response.data.updateTtib.item.text).toBe(updateData.text);
    const [dbTTIB] = await sq.from`tibs`.where({
      id: response.data.updateTtib.item.id
    });
    expect(dbTTIB).not.toBeNull();
    expect(dbTTIB.active).toBe(true);
    expect(dbTTIB.visible).toBe(true);
    expect(dbTTIB.userId).toBe(user.id);
    expect(dbTTIB.text).toBe(updateData.text);
  });

  test("non admin can not update", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const ttib = await createTestTtib(user.id, team.id);
    const updateData = {
      text: "I am text!"
    };

    const response = await graphqlTestCall(
      UPDATE_TTIB_MUTATION,
      {
        id: ttib.id,
        input: updateData
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("can not update text 5 mins after creation", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const ttib = await createTestTtib(user.id, team.id);
    const adminUser = await createAdminUser();

    // update timestamp of ttib to 10 mins ago.
    await sq.from`tibs`
      .where({ id: ttib.id })
      .set({ createdAt: sq.raw("NOW() - INTERVAL '10 MINUTES'") });

    const updateData = {
      text: "I am text!"
    };

    const response = await graphqlTestCall(
      UPDATE_TTIB_MUTATION,
      {
        id: ttib.id,
        input: updateData
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.updateTtib.code).toBe("EXPIRED");
    expect(response.data.updateTtib.message).toBe(
      "You can only update the text of a ttib for 5 minutes after creation. Try deleting and creating a new one."
    );
    expect(response.data.updateTtib.success).toBe(false);
  });

  test("check - updateTTIB can't update global", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const ttib = await createTestTtib(user.id, team.id);
    const adminUser = await createAdminUser();

    // update timestamp of ttib to 10 mins ago.
    await sq.from`tibs`.where({ id: ttib.id }).set({ isGlobal: true });

    const updateData = {
      text: "I am text!"
    };

    const response = await graphqlTestCall(
      UPDATE_TTIB_MUTATION,
      {
        id: ttib.id,
        input: updateData
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.updateTtib.code).toBe("INPUT_ERROR");
    expect(response.data.updateTtib.message).toBe(
      "You are attempting to update a GTIB. Not allowed."
    );
    expect(response.data.updateTtib.success).toBe(false);
  });
});
