// import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestTeam,
  createAdminUser,
  createTestTaskDefinition,
  createTestForm,
  createTestTeamPermissionBit,
  createTestUser,
  createTestTaskAssignment
  // createTestFormValue
} from "../utils/createTestEntities";
import { sq } from "../db";

const UPDATE_TASK_ASSIGNMENT_MUTATION = `
mutation updateTaskAssignment($input: UpdateTaskAssignmentInput! ) {
    updateTaskAssignment(input: $input) {
        code
        message
        success
        item {
          id
          definition {
            id
            form {
              id
              fields {
                name
              }
            }
          }
          team {
            id
          }
          active
          availableTo {
            role
            available
          }
          notAvailableBeforeTs
          notAvailableAfterTs
          sortValue
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
  test("Happy Path ", async () => {
    const user = await createAdminUser();
    const team = await createTestTeam();

    const form = await createTestForm(user.id);
    const taskDefinition = await createTestTaskDefinition(form.id, user.id);

    const form2 = await createTestForm(user.id);
    const taskDefinition2 = await createTestTaskDefinition(form2.id, user.id);

    const taskAssignment = await createTestTaskAssignment(
      taskDefinition.id,
      team.id,
      { MEMBER: true }
    );

    const supplementalFields = [
      {
        label: "I am the label text",
        type: "text",
        name: "testingSupplemental"
      }
    ];

    const response = await graphqlTestCall(
      UPDATE_TASK_ASSIGNMENT_MUTATION,
      {
        input: {
          taskAssignmentId: taskAssignment.id,
          taskDefinitionId: taskDefinition2.id,
          taskRequiredRoles: ["MEMBER", "TRAINING"],
          supplementalFields
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.updateTaskAssignment.success).toEqual(true);

    const dbCheck = await sq`task_assignments`.where({
      id: taskAssignment.id
    });
    expect(dbCheck.length).toBe(1);
    expect(dbCheck[0].taskDefinitionId).toEqual(taskDefinition2.id);
    expect(dbCheck[0].taskRequiredRoles).toEqual(10);
    expect(dbCheck[0].supplementalFields[0]).toEqual(supplementalFields[0]);
    // expect("non authed user cant").toBe("written");
  });

  // perm check. Global admin and team admin
  test("Team Admin can ", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermissionBit(user.id, team.id, { ADMIN: true });

    const form = await createTestForm(user.id);
    const taskDefinition = await createTestTaskDefinition(form.id, user.id);

    const form2 = await createTestForm(user.id);
    const taskDefinition2 = await createTestTaskDefinition(form2.id, user.id);

    const taskAssignment = await createTestTaskAssignment(
      taskDefinition.id,
      team.id,
      { MEMBER: true }
    );

    const response = await graphqlTestCall(
      UPDATE_TASK_ASSIGNMENT_MUTATION,
      {
        input: {
          taskAssignmentId: taskAssignment.id,
          taskDefinitionId: taskDefinition2.id,
          taskRequiredRoles: ["MEMBER", "TRAINING"]
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.updateTaskAssignment.success).toEqual(true);

    const dbCheck = await sq`task_assignments`.where({
      id: taskAssignment.id
    });
    expect(dbCheck.length).toBe(1);
    expect(dbCheck[0].taskDefinitionId).toEqual(taskDefinition2.id);
    expect(dbCheck[0].taskRequiredRoles).toEqual(10);
  });

  // perm check. not normal user
  test("Normal user cant ", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();

    const form = await createTestForm(user.id);
    const taskDefinition = await createTestTaskDefinition(form.id, user.id);

    const form2 = await createTestForm(user.id);
    const taskDefinition2 = await createTestTaskDefinition(form2.id, user.id);

    const taskAssignment = await createTestTaskAssignment(
      taskDefinition.id,
      team.id,
      { MEMBER: true }
    );

    const response = await graphqlTestCall(
      UPDATE_TASK_ASSIGNMENT_MUTATION,
      {
        input: {
          taskAssignmentId: taskAssignment.id,
          taskDefinitionId: taskDefinition2.id,
          taskRequiredRoles: ["MEMBER", "TRAINING"]
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
