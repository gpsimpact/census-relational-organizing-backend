import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import { createTestUser } from "../utils/createTestEntities";
import { sq } from "../db";

const CREATE_GTIB_MUTATION = `
    mutation createGtib($input: CreateGtibInput!) {
        createGtib(input: $input) {
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

    const newData = {
      text: "I am text!"
    };

    const response = await graphqlTestCall(
      CREATE_GTIB_MUTATION,
      {
        input: newData
      },
      { user: { id: user.id } }
    );
    expect(response.data.createGtib.code).toBe("OK");
    expect(response.data.createGtib.message).toBe("GTIB has been created.");
    expect(response.data.createGtib.success).toBe(true);
    expect(response.data.createGtib.item.userId).toBe(user.id);
    expect(response.data.createGtib.item.text).toBe(newData.text);
    const [dbGTIB] = await sq.from`gtibs`.where({
      id: response.data.createGtib.item.id
    });
    expect(dbGTIB).not.toBeNull();
    expect(dbGTIB.active).toBe(true);
    expect(dbGTIB.visible).toBe(true);
    expect(dbGTIB.userId).toBe(user.id);
  });
});