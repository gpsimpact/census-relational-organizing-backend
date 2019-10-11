import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestTeam,
  createAdminUser,
  createTestTaskDefinition,
  createTestTaskAssignment,
  createTestForm,
  createTestUser,
  createTestTeamPermissionBit,
  createTestTarget,
  createTestFormValue
} from "../utils/createTestEntities";

const GET_TASK_DEFINITION_QUERY = `
query taskDefinition($input: TaskDefinitionInput!) {
    taskDefinition(input: $input) {      
        id
        form {
          id
          fields {
            name
          }
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

describe("Task assignment", () => {
  test("happy path", async () => {
    const user = await createAdminUser();

    const formA = await createTestForm(user.id);
    const taskDefinitionA = await createTestTaskDefinition(formA.id, user.id);

    const response = await graphqlTestCall(
      GET_TASK_DEFINITION_QUERY,
      { input: { taskDefinitionId: taskDefinitionA.id } },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskDefinition.id).toEqual(taskDefinitionA.id);
  });
});
