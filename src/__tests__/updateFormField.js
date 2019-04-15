import faker from "faker";

import { graphqlTestCall } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestFormField
} from "../utils/createTestEntities";
import { sq } from "../db";

const UPDATE_FORM_FIELD_MUTATION = `
  mutation updateFormField($id: String!, $input: UpdateFormFieldInput!){
    updateFormField(id:$id, input: $input) {
      code
      message
      success
      item {
       id
       label
       selectOptions {
         label
         value
       }
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

describe("Update FormField", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const formField = await createTestFormField({ userId: user.id });

    const newData = {
      label: "This is updated Label",
      selectOptions: [
        ...formField.selectOptions,
        { label: "charlie", value: "charlie" }
      ]
    };

    const response = await graphqlTestCall(
      UPDATE_FORM_FIELD_MUTATION,
      {
        id: formField.id,
        input: newData
      },
      { user: { id: user.id } }
    );
    // console.log(JSON.stringify(response));
    expect(response.data.updateFormField).not.toBeNull();
    expect(response.data.updateFormField.item.label).toEqual(newData.label);
    expect(response.data.updateFormField.item.selectOptions).toEqual(
      newData.selectOptions
    );

    const [dbFF] = await sq.from`form_fields`.where({ id: formField.id });
    expect(dbFF).toBeDefined();
    expect(dbFF.label).toEqual(newData.label);
    expect(dbFF.name).toEqual(formField.name);
  });
});
