import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import { createTestUser, createTestGtib } from "../utils/createTestEntities";
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

describe("RequestLoginResolver", () => {
  test("happy path", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();
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
      { user: { id: user2.id } }
    );
    // console.log(response);
    expect(response.data.updateGtib.code).toBe("OK");
    expect(response.data.updateGtib.message).toBe("GTIB has been updated.");
    expect(response.data.updateGtib.success).toBe(true);
    expect(response.data.updateGtib.item.userId).toBe(user2.id);
    expect(response.data.updateGtib.item.text).toBe(updateData.text);
    const [dbGTIB] = await sq.from`gtibs`.where({
      id: response.data.updateGtib.item.id
    });
    expect(dbGTIB).not.toBeNull();
    expect(dbGTIB.active).toBe(true);
    expect(dbGTIB.visible).toBe(true);
    expect(dbGTIB.userId).toBe(user2.id);
    expect(dbGTIB.text).toBe(updateData.text);
  });

  test("can not update text 5 mins after creation", async () => {
    const user = await createTestUser();

    const gtib = await createTestGtib(user.id);

    // update timestamp of gtib to 10 mins ago.
    await sq.from`gtibs`
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
      { user: { id: user.id } }
    );
    // console.log(response);
    expect(response.data.updateGtib.code).toBe("EXPIRED");
    expect(response.data.updateGtib.message).toBe(
      "You can only update the text of a gtib for 5 minutes after creation. Try deleting and creating a new one."
    );
    expect(response.data.updateGtib.success).toBe(false);
  });
});
