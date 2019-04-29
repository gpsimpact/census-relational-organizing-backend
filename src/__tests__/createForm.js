import { graphqlTestCall } from "../utils/graphqlTestCall";
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
          validationType: "string",
          validationTests: [
            { method: "required", message: "Value is required." },
            {
              method: "min",
              value: "2",
              message: "Must have length of 2."
            }
          ]
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
    // console.log(response);
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
          validationType: "string",
          validationTests: [
            { method: "required", message: "Value is required." },
            {
              method: "min",
              value: "2",
              message: "Must have length of 2."
            }
          ]
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
          validationType: "string",
          validationTests: [
            { method: "required", message: "Value is required." },
            {
              method: "min",
              value: "2",
              message: "Must have length of 2."
            }
          ]
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
    // console.log(response);
    expect(response.data.createForm.code).toBe("INPUT_ERROR");
    expect(response.data.createForm.message).toBe(
      "Fields have duplicate name properties"
    );
    expect(response.data.createForm.success).toBe(false);
  });
});
