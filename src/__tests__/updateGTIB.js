import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestGtib,
  createTestGlobalPerm,
  createTestTeam,
  createTestTtib
} from "../utils/createTestEntities";
import { sq } from "../db";

const UPDATE_GTIB_MUTATION = `
    mutation updateGtib($id: String!, $input: UpdateGtibInput!) {
      updateGtib(id: $id, input: $input) {
            code
            message
            success
            item {
                id
                text
                userId
                createdAt
                updatedAt
            }
        }
    }
`;

beforeEach(async () => {
  await dbUp();
});

describe("updateGtib", () => {
  test("happy path", async () => {
    const user = await createTestUser();
    const adminUser = await createTestUser();
    await createTestGlobalPerm(adminUser.id, "ADMIN");
    const gtib = await createTestGtib(user.id);

    const updateData = {
      text: "I am text!"
    };

    const response = await graphqlTestCall(
      UPDATE_GTIB_MUTATION,
      {
        id: gtib.id,
        input: updateData
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.updateGtib.code).toBe("OK");
    expect(response.data.updateGtib.message).toBe("GTIB has been updated.");
    expect(response.data.updateGtib.success).toBe(true);
    expect(response.data.updateGtib.item.userId).toBe(adminUser.id);
    expect(response.data.updateGtib.item.text).toBe(updateData.text);
    const [dbGTIB] = await sq.from`tibs`.where({
      id: response.data.updateGtib.item.id
    });
    expect(dbGTIB).not.toBeNull();
    expect(dbGTIB.active).toBe(true);
    expect(dbGTIB.visible).toBe(true);
    expect(dbGTIB.isGlobal).toBe(true);
    expect(dbGTIB.userId).toBe(adminUser.id);
    expect(dbGTIB.text).toBe(updateData.text);
  });

  test("can not update text 5 mins after creation", async () => {
    const adminUser = await createTestUser();
    await createTestGlobalPerm(adminUser.id, "ADMIN");

    const gtib = await createTestGtib(adminUser.id);

    // update timestamp of gtib to 10 mins ago.
    await sq.from`tibs`
      .where({ id: gtib.id })
      .set({ createdAt: sq.raw("NOW() - INTERVAL '10 MINUTES'") });

    const updateData = {
      text: "I am text!"
    };

    const response = await graphqlTestCall(
      UPDATE_GTIB_MUTATION,
      {
        id: gtib.id,
        input: updateData
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.updateGtib.code).toBe("EXPIRED");
    expect(response.data.updateGtib.message).toBe(
      "You can only update the text of a gtib for 5 minutes after creation. Try deleting and creating a new one."
    );
    expect(response.data.updateGtib.success).toBe(false);
  });

  test("cant use to update tib", async () => {
    const adminUser = await createTestUser();
    const team = await createTestTeam();
    await createTestGlobalPerm(adminUser.id, "ADMIN");

    const ttib = await createTestTtib(adminUser.id, team.id);

    const updateData = {
      text: "I am text!"
    };

    const response = await graphqlTestCall(
      UPDATE_GTIB_MUTATION,
      {
        id: ttib.id,
        input: updateData
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.updateGtib.code).toBe("INPUT_ERROR");
    expect(response.data.updateGtib.message).toBe(
      "You are attempting to update a TTIB. Not allowed."
    );
    expect(response.data.updateGtib.success).toBe(false);
  });
});
