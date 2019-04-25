import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTtib,
  createTestTeam
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
                gtibLink
            }
        }
    }
`;

beforeEach(async () => {
  await dbUp();
});

describe("RequestLoginResolver", () => {
  test("happy path", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();
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
      { user: { id: user2.id } }
    );
    // console.log(response);
    expect(response.data.updateTtib.code).toBe("OK");
    expect(response.data.updateTtib.message).toBe("TTIB has been updated.");
    expect(response.data.updateTtib.success).toBe(true);
    expect(response.data.updateTtib.item.userId).toBe(user2.id);
    expect(response.data.updateTtib.item.text).toBe(updateData.text);
    const [dbTTIB] = await sq.from`ttibs`.where({
      id: response.data.updateTtib.item.id
    });
    expect(dbTTIB).not.toBeNull();
    expect(dbTTIB.active).toBe(true);
    expect(dbTTIB.visible).toBe(true);
    expect(dbTTIB.userId).toBe(user2.id);
    expect(dbTTIB.text).toBe(updateData.text);
  });

  test("can not update text 5 mins after creation", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const ttib = await createTestTtib(user.id, team.id);

    // update timestamp of ttib to 10 mins ago.
    await sq.from`ttibs`
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
      { user: { id: user.id } }
    );
    // console.log(response);
    expect(response.data.updateTtib.code).toBe("EXPIRED");
    expect(response.data.updateTtib.message).toBe(
      "You can only update the text of a ttib for 5 minutes after creation. Try deleting and creating a new one."
    );
    expect(response.data.updateTtib.success).toBe(false);
  });
});
