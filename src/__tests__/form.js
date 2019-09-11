// import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestForm,
  createTestTarget,
  createTestFormValue,
  createTestGlobalPerm,
  createTestTeam
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
          validationTests
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
    const adminUser = await createTestUser();
    await createTestGlobalPerm(adminUser.id, "ADMIN");
    const form = await createTestForm(adminUser.id);
    const response = await graphqlTestCall(
      GET_FORM_QUERY,
      { id: form.id },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.form.id).toEqual(form.id);
    expect(response.data.form.title).toEqual(form.title);
    expect(response.data.form.fields[0].value).toBeNull();
    // maks sure Double deserialization occurs here.
    expect(JSON.parse(response.data.form.fields[0].validationTests)).toEqual([
      ["yup.number"],
      ["yup.required"],
      ["yup.min", 50],
      ["yup.max", 500]
    ]);
  });

  test("Happy Path By Id, WITH value", async () => {
    const adminUser = await createTestUser();
    const team = await createTestTeam();
    await createTestGlobalPerm(adminUser.id, "ADMIN");
    const form = await createTestForm(adminUser.id);
    const target = await createTestTarget({
      userId: adminUser.id,
      teamId: team.id
    });
    const formValue = await createTestFormValue(
      form.id,
      adminUser.id,
      target.id,
      form.fields[0].name
    );
    const response = await graphqlTestCall(
      GET_FORM_QUERY,
      {
        id: form.id,
        targetId: target.id
      },
      { user: { id: adminUser.id } }
    );
    expect(response.data.form.id).toEqual(form.id);
    expect(response.data.form.label).toEqual(form.label);
    expect(response.data.form.fields[0].value).toBe(formValue.value);
  });
});
