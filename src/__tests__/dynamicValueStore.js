import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import { createTestUser, createTestTarget } from "../utils/createTestEntities";
import { sq } from "../db";

const WRITE_VALUE_MUTATION = `
    mutation writeValues($input: WriteValuesInput!) {
        writeValues(input: $input) {
        code
        message
        success
      }
    }
`;

beforeEach(async () => {
  await dbUp();
});

// afterEach(async () => {
//   await dbDown();
// });

describe("RequestLoginResolver", () => {
  test("happy path", async () => {
    const user = await createTestUser();
    const target = await createTestTarget();

    const response = await graphqlTestCall(WRITE_VALUE_MUTATION, {
      input: {
        data: [
          {
            fieldId: faker.random.uuid(),
            value: "foo",
            userId: user.id,
            targetId: target.id
          },
          {
            fieldId: faker.random.uuid(),
            value: "bar",
            userId: user.id,
            targetId: target.id
          }
        ]
      }
    });
    expect(response.data.writeValues.code).toBe("OK");
    expect(response.data.writeValues.message).toBe(
      "All values have been written."
    );
    expect(response.data.writeValues.success).toBe(true);

    const dbValues = await sq.from`dynamic_value_store`.where({
      userId: user.id,
      targetId: target.id
    });
    expect(dbValues.length).toBe(2);
  });

  test("one bad entry rollsback all.", async () => {
    const user = await createTestUser();
    const target = await createTestTarget();

    const response = await graphqlTestCall(WRITE_VALUE_MUTATION, {
      input: {
        data: [
          {
            fieldId: faker.random.uuid(),
            value: "foo",
            userId: user.id,
            targetId: target.id
          },
          {
            fieldId: faker.random.uuid(),
            value: "bar",
            userId: "972a4867-605b-4959-962f-8aeca6799267",
            targetId: target.id
          }
        ]
      }
    });
    expect(response.data.writeValues.code).toBe("INPUT_ERROR");
    expect(response.data.writeValues.message).toBe(
      "No values were written. Check your inputs."
    );
    expect(response.data.writeValues.success).toBe(false);
  });
});
