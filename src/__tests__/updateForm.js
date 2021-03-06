import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestForm,
  createTestGlobalPerm
} from "../utils/createTestEntities";
import { sq } from "../db";

const UPDATE_FORM_MUTATION = `
  mutation updateForm($id: String!, $input: UpdateFormInput!){
    updateForm(id:$id, input: $input) {
      code
      message
      success
      item {
       id
       buttonText
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

describe("Update Form", () => {
  test("Happy Path", async () => {
    const adminUser = await createTestUser();
    await createTestGlobalPerm(adminUser.id, "ADMIN");
    const form = await createTestForm(adminUser.id);

    const newData = {
      buttonText: "zim zam!"
    };

    const response = await graphqlTestCall(
      UPDATE_FORM_MUTATION,
      {
        id: form.id,
        input: newData
      },
      { user: { id: adminUser.id } }
    );
    expect(response.data.updateForm).not.toBeNull();
    expect(response.data.updateForm.code).toBe("OK");
    expect(response.data.updateForm.success).toBe(true);
    expect(response.data.updateForm.message).toBe("Form updated.");
    expect(response.data.updateForm.item.label).toEqual(newData.label);
    expect(response.data.updateForm.item.selectOptions).toEqual(
      newData.selectOptions
    );

    const [dbForm] = await sq.from`forms`.where({ id: form.id });
    expect(dbForm).toBeDefined();
    expect(dbForm.buttonText).toEqual(newData.buttonText);
    expect(dbForm.title).toEqual(form.title);
  });

  test("Duplicate form name check", async () => {
    const adminUser = await createTestUser();
    await createTestGlobalPerm(adminUser.id, "ADMIN");
    const form = await createTestForm(adminUser.id);

    const newData = {
      fields: [
        {
          label: "I am the label text",
          type: "text",
          name: "alpha",
          selectOptions: [
            {
              value: "alpha",
              label: "alpha"
            },
            {
              value: "beta",
              label: "beta"
            }
          ],
          placeholder: "I am a place holder",
          validationTests: JSON.stringify([
            ["yup.number"],
            ["yup.required"],
            ["yup.min", 50],
            ["yup.max", 500]
          ])
        },
        {
          label: "I am the label text",
          type: "text",
          name: "alpha",
          selectOptions: [
            {
              value: "alpha",
              label: "alpha"
            },
            {
              value: "beta",
              label: "beta"
            }
          ],
          placeholder: "I am a place holder",
          validationTests: JSON.stringify([
            ["yup.number"],
            ["yup.required"],
            ["yup.min", 50],
            ["yup.max", 500]
          ])
        }
      ]
    };

    const response = await graphqlTestCall(
      UPDATE_FORM_MUTATION,
      {
        id: form.id,
        input: newData
      },
      { user: { id: adminUser.id } }
    );
    expect(response.data.updateForm.code).toBe("INPUT_ERROR");
    expect(response.data.updateForm.message).toBe(
      "Fields have duplicate name properties"
    );
    expect(response.data.updateForm.success).toBe(false);
  });
});
