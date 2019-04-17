// import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestFormField,
  createTestTarget,
  createTestDVSvalue
} from "../utils/createTestEntities";

const GET_FF_QUERY = `
query formField($id: String!, $targetId: String) {
    formField(id: $id) {
        id
        label
        type
        name
        value(targetId: $targetId)
        selectOptions {
            value
            label
        }
        placeholder
        validationTests {
            method
            value
            message
        }
        formId
        validationType
    }
}
`;

beforeEach(async () => {
  await dbUp();
});

afterEach(async () => {
  await dbDown();
});

describe("User", () => {
  test("Happy Path By Id, no value", async () => {
    const user = await createTestUser();
    const ff = await createTestFormField({ user_id: user.id });
    const response = await graphqlTestCall(GET_FF_QUERY, { id: ff.id });
    // console.log(JSON.stringify(response, null, "\t"));
    expect(response.data.formField.id).toEqual(ff.id);
    expect(response.data.formField.label).toEqual(ff.label);
    expect(response.data.formField.value).toBeNull();
  });

  test("Happy Path By Id, WITH value", async () => {
    const user = await createTestUser();
    const ff = await createTestFormField({ user_id: user.id });
    const target = await createTestTarget();
    const dvsv = await createTestDVSvalue(ff.id, user.id, target.id);
    const response = await graphqlTestCall(GET_FF_QUERY, {
      id: ff.id,
      targetId: target.id
    });
    // console.log(JSON.stringify(response, null, "\t"));
    expect(response.data.formField.id).toEqual(ff.id);
    expect(response.data.formField.label).toEqual(ff.label);
    expect(response.data.formField.value).toBe(dvsv.value);
  });
});
