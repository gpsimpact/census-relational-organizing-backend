import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestGlobalPerm
} from "../utils/createTestEntities";
import { sq } from "../db";

const CREATE_FORM_MUTATION = `
    mutation createForm($input: CreateFormInput!) {
      createForm(input: $input) {
        code
        message
        success
        item {
          id
        }
      }
    }
`;

beforeEach(async () => {
  await dbUp();
});

describe("RequestLoginResolver", () => {
  test("happy path", async () => {
    const adminUser = await createTestUser();
    await createTestGlobalPerm(adminUser.id, "ADMIN");

    const formData = {
      title: "This is form title",
      buttonText: "Button Text",
      redirectRoute: "/someRoute",
      description: "test description",
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
        }
      ]
    };

    const response = await graphqlTestCall(
      CREATE_FORM_MUTATION,
      {
        input: formData
      },
      { user: { id: adminUser.id } }
    );
    debugResponse(response);
    expect(response.data.createForm.code).toBe("OK");
    expect(response.data.createForm.message).toBe("Form has been created.");
    expect(response.data.createForm.success).toBe(true);
    const [dbForm] = await sq.from`forms`.where({
      id: response.data.createForm.item.id
    });
    expect(dbForm).not.toBeNull();
    expect(dbForm).toEqual(
      Object.assign({}, formData, {
        id: response.data.createForm.item.id,
        userId: adminUser.id
      })
    );
  });

  test("Can not create fields with duplicate names", async () => {
    const adminUser = await createTestUser();
    await createTestGlobalPerm(adminUser.id, "ADMIN");

    const formData = {
      title: "This is form title",
      buttonText: "Button Text",
      redirectRoute: "/someRoute",
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
      CREATE_FORM_MUTATION,
      {
        input: formData
      },
      { user: { id: adminUser.id } }
    );
    expect(response.data.createForm.code).toBe("INPUT_ERROR");
    expect(response.data.createForm.message).toBe(
      "Fields have duplicate name properties"
    );
    expect(response.data.createForm.success).toBe(false);
  });
});
