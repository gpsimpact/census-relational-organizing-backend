// import faker from "faker";
import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestForm,
  createTestTarget,
  createTestFormValue
} from "../utils/createTestEntities";

const GET_FORM_QUERY = `
query form($id: String!, $targetId: String) {
    form(id: $id) {
      id
      title
      buttonText
      redirectRoute
      fields {
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
          validationType
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

describe("User", () => {
  test("Happy Path By Id, no value", async () => {
    const user = await createTestUser();
    const form = await createTestForm(user.id);
    const response = await graphqlTestCall(GET_FORM_QUERY, { id: form.id });
    // console.log(JSON.stringify(response, null, "\t"));
    expect(response.data.form.id).toEqual(form.id);
    expect(response.data.form.title).toEqual(form.title);
    expect(response.data.form.fields[0].value).toBeNull();
  });

  test("Happy Path By Id, WITH value", async () => {
    const user = await createTestUser();
    const form = await createTestForm(user.id);
    const target = await createTestTarget();
    const formValue = await createTestFormValue(
      form.id,
      user.id,
      target.id,
      form.fields[0].name
    );
    const response = await graphqlTestCall(GET_FORM_QUERY, {
      id: form.id,
      targetId: target.id
    });
    // console.log(JSON.stringify(response, null, "\t"));
    expect(response.data.form.id).toEqual(form.id);
    expect(response.data.form.label).toEqual(form.label);
    expect(response.data.form.fields[0].value).toBe(formValue.value);
  });
});