// import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestTeam,
  createAdminUser,
  createTestTaskDefinition,
  createTestForm,
  createTestTeamPermissionBit,
  createTestUser
  // createTestFormValue
} from "../utils/createTestEntities";
import { sq } from "../db";

const CREATE_TASK_ASSIGNMENT_MUTATION = `
mutation createTaskAssignment($input: CreateTaskAssignmentInput! ) {
    createTaskAssignment(input: $input) {
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

    const response = await graphqlTestCall(
      CREATE_TASK_ASSIGNMENT_MUTATION,
      {
        input: {
          teamId: team.id,
          taskDefinitionId: taskDefinition.id,
          taskRequiredRoles: ["MEMBER", "TRAINING"]
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.createTaskAssignment.success).toEqual(true);

    const dbCheck = await sq`task_assignments`.where({
      teamId: team.id,
      taskDefinitionId: taskDefinition.id,
      id: response.data.createTaskAssignment.item.id
    });
    expect(dbCheck.length).toBe(1);
    expect(dbCheck[0].taskRequiredRoles).toEqual(10);
    expect(response.data.createTaskAssignment.item.sortValue).toBe(0);

    const form2 = await createTestForm(user.id);
    const taskDefinition2 = await createTestTaskDefinition(form2.id, user.id);

    const response2 = await graphqlTestCall(
      CREATE_TASK_ASSIGNMENT_MUTATION,
      {
        input: {
          teamId: team.id,
          taskDefinitionId: taskDefinition2.id,
          taskRequiredRoles: ["MEMBER", "TRAINING"]
        }
      },
      { user: { id: user.id } }
    );

    expect(response2.data.createTaskAssignment.item.sortValue).toBe(1);
  });

  // perm check. Global admin and team admin
  test("Team Admin can ", async () => {
    const teamAdmin = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermissionBit(teamAdmin.id, team.id, { ADMIN: true });

    const form = await createTestForm(teamAdmin.id);
    const taskDefinition = await createTestTaskDefinition(
      form.id,
      teamAdmin.id
    );

    const response = await graphqlTestCall(
      CREATE_TASK_ASSIGNMENT_MUTATION,
      {
        input: {
          teamId: team.id,
          taskDefinitionId: taskDefinition.id,
          taskRequiredRoles: ["MEMBER", "TRAINING"]
        }
      },
      { user: { id: teamAdmin.id } }
    );
    debugResponse(response);
    expect(response.data.createTaskAssignment.success).toEqual(true);
  });

  // perm check. not normal user
  test("Team Admin can ", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();

    const form = await createTestForm(user.id);
    const taskDefinition = await createTestTaskDefinition(form.id, user.id);

    const response = await graphqlTestCall(
      CREATE_TASK_ASSIGNMENT_MUTATION,
      {
        input: {
          teamId: team.id,
          taskDefinitionId: taskDefinition.id,
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
