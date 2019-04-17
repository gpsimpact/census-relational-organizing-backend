import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import { createTestUser } from "../utils/createTestEntities";
import { sq } from "../db";

const CREATE_FORM_FIELD_MUTATION = `
    mutation createFormField($input: CreateFormFieldInput!) {
      createFormField(input: $input) {
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
    const user = await createTestUser();

    const formFieldData = {
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
    };

    const response = await graphqlTestCall(
      CREATE_FORM_FIELD_MUTATION,
      {
        input: formFieldData
      },
      { user: { id: user.id } }
    );
    expect(response.data.createFormField.code).toBe("OK");
    expect(response.data.createFormField.message).toBe(
      "Form field has been created."
    );
    expect(response.data.createFormField.success).toBe(true);

    const [dbFF] = await sq.from`form_fields`.where({
      id: response.data.createFormField.item.id
    });
    expect(dbFF).not.toBeNull();
    expect(dbFF).toEqual(
      Object.assign({}, formFieldData, {
        id: response.data.createFormField.item.id,
        userId: user.id
      })
    );
  });
});
