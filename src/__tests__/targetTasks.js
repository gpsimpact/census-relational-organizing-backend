import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
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

const GET_TARGET_TASKS_QUERY = `
query targetTasks($targetId: String!) {
    targetTasks(targetId: $targetId) {
        id
        definition {
          id
          form {
            id
            fields {
              name
              value(targetId: $targetId)
            }
          }
        }
        team {
          id
        }
        active
        available(targetId: $targetId) {
          available
          nonAvailableCode
        }
        availableTo {
          role
          available
        }
        complete(targetId: $targetId)
      }
    }
`;

beforeEach(async () => {
  await dbUp();
});

describe("Task assignment", () => {
  test("happy path", async () => {
    const user = await createAdminUser();

    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });

    const formA = await createTestForm(user.id);
    const taskDefinitionA = await createTestTaskDefinition(formA.id, user.id);
    const taskAssignmentA = await createTestTaskAssignment(
      taskDefinitionA.id,
      team.id,
      {
        MEMBER: true
      }
    );

    const formValue = await createTestFormValue(
      formA.id,
      user.id,
      target.id,
      formA.fields[0].name
    );

    const formB = await createTestForm(user.id);
    const taskDefinitionB = await createTestTaskDefinition(formB.id, user.id);
    const taskAssignmentB = await createTestTaskAssignment(
      taskDefinitionB.id,
      team.id,
      {
        MEMBER: true
      }
    );

    const response = await graphqlTestCall(
      GET_TARGET_TASKS_QUERY,
      { targetId: target.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.targetTasks.length).toEqual(2);
    const taskAResponse = _.find(response.data.targetTasks, x => {
      return (x.id = taskAssignmentA.id);
    });
    const taskBResponse = _.find(response.data.targetTasks, x => {
      return (x.id = taskAssignmentB.id);
    });

    // verify contains values.
    expect(taskAResponse.definition.form.fields[0].value).toEqual(
      formValue.value
    );
    expect(taskBResponse.id).toEqual(taskAssignmentB.id);
    //
  });

  test("Permission: Must be own target", async () => {
    const owner = await createAdminUser();
    const nonowner = await createTestUser();

    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: owner.id,
      teamId: team.id
    });

    const formA = await createTestForm(owner.id);
    const taskDefinitionA = await createTestTaskDefinition(formA.id, owner.id);
    await createTestTaskAssignment(taskDefinitionA.id, team.id, {
      MEMBER: true
    });

    const response = await graphqlTestCall(
      GET_TARGET_TASKS_QUERY,
      { targetId: target.id },
      { user: { id: nonowner.id } }
    );
    debugResponse(response);
    expect(response.data.targetTasks).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
    const response2 = await graphqlTestCall(
      GET_TARGET_TASKS_QUERY,
      { targetId: target.id },
      { user: { id: owner.id } }
    );
    debugResponse(response2);
    expect(response2.data.targetTasks.length).toBe(1);
  });

  test("Permission: team admin can read other user target", async () => {
    const owner = await createAdminUser();
    const teamAdmin = await createTestUser();
    const team = await createTestTeam();

    await createTestTeamPermissionBit(teamAdmin.id, team.id, { ADMIN: true });

    const target = await createTestTarget({
      userId: owner.id,
      teamId: team.id
    });

    const formA = await createTestForm(owner.id);
    const taskDefinitionA = await createTestTaskDefinition(formA.id, owner.id);
    await createTestTaskAssignment(taskDefinitionA.id, team.id, {
      MEMBER: true
    });

    const response = await graphqlTestCall(
      GET_TARGET_TASKS_QUERY,
      { targetId: target.id },
      { user: { id: teamAdmin.id } }
    );
    debugResponse(response);
    expect(response.data.targetTasks.length).toBe(1);
  });

  test("Permission: Global admin can read other user target", async () => {
    const owner = await createTestUser();
    const globalAdmin = await createAdminUser();
    const team = await createTestTeam();

    const target = await createTestTarget({
      userId: owner.id,
      teamId: team.id
    });

    const formA = await createTestForm(owner.id);
    const taskDefinitionA = await createTestTaskDefinition(formA.id, owner.id);
    await createTestTaskAssignment(taskDefinitionA.id, team.id, {
      MEMBER: true
    });

    const response = await graphqlTestCall(
      GET_TARGET_TASKS_QUERY,
      { targetId: target.id },
      { user: { id: globalAdmin.id } }
    );
    debugResponse(response);
    expect(response.data.targetTasks.length).toBe(1);
  });
});
