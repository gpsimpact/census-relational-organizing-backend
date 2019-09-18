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
  createTestTarget
} from "../utils/createTestEntities";
import faker from "faker";

const UPDATE_TARGET_TASK_MUTATION = `
mutation updateTargetTask($taskAssignmentId: String!, $targetId: String!, $input: UpdateTargetTaskInput!) {
    updateTargetTask(taskAssignmentId:$taskAssignmentId, targetId: $targetId, input: $input) {
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
            nonAvailableMessage
          }
          availableTo {
            role
            available
          }
          complete(targetId: $targetId)
        }
      }
    }
`;

beforeEach(async () => {
  await dbUp();
});

describe("Task assignment", () => {
  test("happy path. status and values are updated.", async () => {
    const user = await createAdminUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });
    const form = await createTestForm(user.id);
    const taskDefinition = await createTestTaskDefinition(form.id, user.id);
    const taskAssignment = await createTestTaskAssignment(
      taskDefinition.id,
      team.id,
      {
        MEMBER: true
      }
    );

    const response = await graphqlTestCall(
      UPDATE_TARGET_TASK_MUTATION,
      {
        targetId: target.id,
        taskAssignmentId: taskAssignment.id,
        input: {
          complete: true,
          fieldValues: [
            {
              name: form.fields[0].name,
              value: "IAM A TEST VALUE"
            }
          ]
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.updateTargetTask.success).toBe(true);
    expect(response.data.updateTargetTask.item.id).toEqual(taskAssignment.id);
    expect(
      response.data.updateTargetTask.item.definition.form.fields[0].name
    ).toEqual(form.fields[0].name);
    expect(
      response.data.updateTargetTask.item.definition.form.fields[0].value
    ).toEqual("IAM A TEST VALUE");
    //
  });

  // fails if not existing taskassignment
  test("fails if not existing taskassignment", async () => {
    const user = await createAdminUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });

    const response = await graphqlTestCall(
      UPDATE_TARGET_TASK_MUTATION,
      {
        targetId: target.id,
        taskAssignmentId: faker.random.uuid(),
        input: {
          complete: true
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.updateTargetTask.success).toBe(false);
    expect(response.data.updateTargetTask.message).toEqual(
      "No task assignment with this ID exists"
    );
    expect(response.data.updateTargetTask.item).toBeNull();
    expect(response.data.updateTargetTask.code).toEqual("DOES_NOT_EXIST");
  });

  // fails if not existing target
  test("fails if not existing target", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const form = await createTestForm(user.id);
    const taskDefinition = await createTestTaskDefinition(form.id, user.id);
    const taskAssignment = await createTestTaskAssignment(
      taskDefinition.id,
      team.id,
      {
        MEMBER: true
      }
    );

    const response = await graphqlTestCall(
      UPDATE_TARGET_TASK_MUTATION,
      {
        targetId: faker.random.uuid(),
        taskAssignmentId: taskAssignment.id,
        input: {
          complete: true
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    // expect(response.data.updateTargetTask.success).toBe(false);
    // expect(response.data.updateTargetTask.message).toEqual(
    //   "No target with this ID exists"
    // );
    // expect(response.data.updateTargetTask.item).toBeNull();
    // expect(response.data.updateTargetTask.code).toEqual("DOES_NOT_EXIST");

    // above code is blocked by target reliant perm check.
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  // must be own target
  // team admin can update
  // global admin can update

  test("Permission: Must be own target", async () => {
    const owner = await createTestUser();
    const nonOwner = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: owner.id,
      teamId: team.id
    });
    const form = await createTestForm(owner.id);
    const taskDefinition = await createTestTaskDefinition(form.id, owner.id);
    const taskAssignment = await createTestTaskAssignment(
      taskDefinition.id,
      team.id,
      {
        MEMBER: true
      }
    );

    const response = await graphqlTestCall(
      UPDATE_TARGET_TASK_MUTATION,
      {
        targetId: target.id,
        taskAssignmentId: taskAssignment.id,
        input: {
          complete: true,
          fieldValues: [
            {
              name: form.fields[0].name,
              value: "IAM A TEST VALUE"
            }
          ]
        }
      },
      { user: { id: nonOwner.id } }
    );
    debugResponse(response);
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
    const response2 = await graphqlTestCall(
      UPDATE_TARGET_TASK_MUTATION,
      {
        targetId: target.id,
        taskAssignmentId: taskAssignment.id,
        input: {
          complete: true,
          fieldValues: [
            {
              name: form.fields[0].name,
              value: "IAM A TEST VALUE"
            }
          ]
        }
      },
      { user: { id: owner.id } }
    );
    debugResponse(response2);
    expect(response2.data.updateTargetTask.success).toEqual(true);
  });

  test("Permission: team admin update for other user target", async () => {
    const owner = await createTestUser();
    const nonOwner = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermissionBit(nonOwner.id, team.id, { ADMIN: true });
    const target = await createTestTarget({
      userId: owner.id,
      teamId: team.id
    });
    const form = await createTestForm(owner.id);
    const taskDefinition = await createTestTaskDefinition(form.id, owner.id);
    const taskAssignment = await createTestTaskAssignment(
      taskDefinition.id,
      team.id,
      {
        MEMBER: true
      }
    );

    const response = await graphqlTestCall(
      UPDATE_TARGET_TASK_MUTATION,
      {
        targetId: target.id,
        taskAssignmentId: taskAssignment.id,
        input: {
          complete: true
        }
      },
      { user: { id: nonOwner.id } }
    );
    debugResponse(response);
    expect(response.data.updateTargetTask.success).toEqual(true);
  });

  test("Permission: Global admin can update for other user target", async () => {
    const owner = await createTestUser();
    const nonOwner = await createAdminUser();
    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: owner.id,
      teamId: team.id
    });
    const form = await createTestForm(owner.id);
    const taskDefinition = await createTestTaskDefinition(form.id, owner.id);
    const taskAssignment = await createTestTaskAssignment(
      taskDefinition.id,
      team.id,
      {
        MEMBER: true
      }
    );

    const response = await graphqlTestCall(
      UPDATE_TARGET_TASK_MUTATION,
      {
        targetId: target.id,
        taskAssignmentId: taskAssignment.id,
        input: {
          complete: true
        }
      },
      { user: { id: nonOwner.id } }
    );
    debugResponse(response);
    expect(response.data.updateTargetTask.success).toEqual(true);
  });
});
