import faker from "faker";
// import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createAdminUser,
  createTestForm
} from "../utils/createTestEntities";
import { sq } from "../db";

require("dotenv").config();

const CREATE_TASK_DEFINITION_MUTATION = `
  mutation createTaskDefinition($input: CreateTaskDefinitionInput!) {
     createTaskDefinition(input:$input) {
      code
      success
      message
      item {
        id
        active
        form {
          id
        }
        createdBy {
          id
        }
        lastEditedBy {
          id
        }
        points
        createdAt
        updatedAt
        isGloballyAvailable
      }
    }
  }
`;

beforeEach(async () => {
  await dbUp();
});

describe("Create Task Definition", () => {
  test("Happy Path / bare bones", async () => {
    const user = await createAdminUser();
    const form = await createTestForm(user.id);

    const newTaskDefinition = {
      formId: form.id
    };

    const response = await graphqlTestCall(
      CREATE_TASK_DEFINITION_MUTATION,
      {
        input: newTaskDefinition
      },
      { user: { id: user.id } }
    );
    debugResponse(response);

    expect(response.data.createTaskDefinition).not.toBeNull();
    expect(response.data.createTaskDefinition.item.form.id).toEqual(form.id);

    const [dbTaskDefinition] = await sq.from`task_definitions`.where({
      id: response.data.createTaskDefinition.item.id
    });
    expect(dbTaskDefinition).toBeDefined();
    expect(dbTaskDefinition.formId).toEqual(form.id);
    // Also check email is lower case (as per middleware)
    expect(dbTaskDefinition.createdBy).toBe(user.id);
    expect(dbTaskDefinition.created_at).not.toBeNull();
    expect(dbTaskDefinition.updated_at).toEqual(dbTaskDefinition.created_at);
  });

  // form must exist
  test("Duplicate error", async () => {
    const user = await createTestUser();

    // no input
    const response = await graphqlTestCall(
      CREATE_TASK_DEFINITION_MUTATION,
      {
        input: {
          formId: faker.random.uuid()
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("Non permissions block", async () => {
    const user = await createTestUser();
    const form = await createTestForm(user.id);

    const newTaskDefinition = {
      formId: form.id
    };

    const response = await graphqlTestCall(
      CREATE_TASK_DEFINITION_MUTATION,
      {
        input: newTaskDefinition
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
