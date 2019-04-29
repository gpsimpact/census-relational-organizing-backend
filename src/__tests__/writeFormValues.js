// import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTarget,
  createTestForm,
  createTestGlobalPerm
} from "../utils/createTestEntities";
import { sq } from "../db";

const WRITE_VALUE_MUTATION = `
    mutation writeFormValues($input: WriteFormValuesInput!) {
        writeFormValues(input: $input) {
        code
        message
        success
      }
    }
`;

beforeEach(async () => {
  await dbUp();
});

describe("Write Form Values", () => {
  test("happy path", async () => {
    const user = await createTestUser();
    const adminUser = await createTestUser();
    await createTestGlobalPerm(adminUser.id, "ADMIN");
    const target = await createTestTarget();
    const form = await createTestForm(adminUser.id);

    const response = await graphqlTestCall(
      WRITE_VALUE_MUTATION,
      {
        input: {
          data: [
            {
              formId: form.id,
              name: "foo1",
              value: "foo2",
              userId: user.id,
              targetId: target.id
            },
            {
              formId: form.id,
              name: "bar1",
              value: "bar2",
              userId: user.id,
              targetId: target.id
            }
          ]
        }
      },
      { user: { id: adminUser.id } }
    );
    // console.log(JSON.stringify(response, null, "\t"));
    expect(response.data.writeFormValues.code).toBe("OK");
    expect(response.data.writeFormValues.message).toBe(
      "All values have been written."
    );
    expect(response.data.writeFormValues.success).toBe(true);

    const dbValues = await sq.from`form_values`.where({
      userId: user.id,
      targetId: target.id,
      formId: form.id
    });
    expect(dbValues.length).toBe(2);
  });

  test("one bad entry rollsback all.", async () => {
    const user = await createTestUser();
    const adminUser = await createTestUser();
    await createTestGlobalPerm(adminUser.id, "ADMIN");
    const target = await createTestTarget();
    const form = await createTestForm(adminUser.id);

    const response = await graphqlTestCall(
      WRITE_VALUE_MUTATION,
      {
        input: {
          data: [
            {
              formId: form.id,
              name: "foo1",
              value: "foo2",
              userId: user.id,
              targetId: target.id
            },
            {
              formId: form.id,
              name: "bar1",
              value: "bar2",
              userId: "972a4867-605b-4959-962f-8aeca6799267",
              targetId: target.id
            }
          ]
        }
      },
      { user: { id: adminUser.id } }
    );
    expect(response.data.writeFormValues.code).toBe("INPUT_ERROR");
    expect(response.data.writeFormValues.message).toBe(
      "No values were written. Check your inputs."
    );
    expect(response.data.writeFormValues.success).toBe(false);
  });
});
