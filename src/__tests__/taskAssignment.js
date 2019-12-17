// import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestTeam,
  createAdminUser,
  createTestTaskDefinition,
  createTestTaskAssignment,
  createTestForm,
  createTestTeamPermission,
  createTestTarget,
  createTestFormValue
} from "../utils/createTestEntities";
import { sq } from "../db";
import _ from "lodash";

const GET_TASK_ASSIGNMENT_QUERY = `
query taskAssignment($id: String!, $targetId: String!) {
    taskAssignment(id: $id) {
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
        complete(targetId: $targetId)
        notAvailableBeforeTs
        notAvailableAfterTs
        sortValue
        supplementalFields {
          label
          name
          type
          value(targetId: $targetId)
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
    const target = await createTestTarget({ userId: user.id, teamId: team.id });

    const form = await createTestForm(user.id);
    const taskDefinition = await createTestTaskDefinition(form.id, user.id);
    const taskAssignment = await createTestTaskAssignment(
      taskDefinition.id,
      team.id
    );

    const response = await graphqlTestCall(
      GET_TASK_ASSIGNMENT_QUERY,
      { id: taskAssignment.id, targetId: target.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskAssignment.id).toEqual(taskAssignment.id);
    expect(response.data.taskAssignment.definition.id).toEqual(
      taskDefinition.id
    );
    expect(response.data.taskAssignment.team.id).toEqual(team.id);
    // expect(response.data.taskAssignment.availableTo).toEqual([
    //   {
    //     role: "APPLICANT",
    //     available: false
    //   },
    //   {
    //     role: "TRAINING",
    //     available: false
    //   },
    //   {
    //     role: "ELEVATED",
    //     available: false
    //   },
    //   {
    //     role: "MEMBER",
    //     available: false
    //   },
    //   {
    //     role: "ADMIN",
    //     available: false
    //   },
    //   {
    //     role: "DENIED",
    //     available: false
    //   }
    // ]);
    // expect(response.data.taskAssignment.available.available).toEqual(true);
    expect(response.data.taskAssignment.sortValue).toBeNull();
  });

  // test("available if has permission ", async () => {
  //   const user = await createTestUser();

  //   const team = await createTestTeam();
  //   const target = await createTestTarget({ userId: user.id, teamId: team.id });
  //   // createTestTeamPermission(user.id, team.id, "MEMBER");
  //   await createTestTeamPermission(user.id, team.id, "MEMBER");
  //   const form = await createTestForm(user.id);
  //   const taskDefinition = await createTestTaskDefinition(form.id, user.id);
  //   const taskAssignment = await createTestTaskAssignment(
  //     taskDefinition.id,
  //     team.id,
  //     {
  //       MEMBER: true
  //     }
  //   );

  //   const response = await graphqlTestCall(
  //     GET_TASK_ASSIGNMENT_QUERY,
  //     { id: taskAssignment.id, targetId: target.id },
  //     { user: { id: user.id } }
  //   );
  //   debugResponse(response);
  //   expect(response.data.taskAssignment.available.available).toEqual(true);
  // });

  // test("not available if not has permission ", async () => {
  //   const user = await createTestUser();

  //   const team = await createTestTeam();
  //   const target = await createTestTarget({ userId: user.id, teamId: team.id });
  //   await createTestTeamPermission(user.id, team.id, "TRAINING");
  //   const form = await createTestForm(user.id);
  //   const taskDefinition = await createTestTaskDefinition(form.id, user.id);
  //   const taskAssignment = await createTestTaskAssignment(
  //     taskDefinition.id,
  //     team.id,
  //     {
  //       MEMBER: true
  //     }
  //   );

  //   const response = await graphqlTestCall(
  //     GET_TASK_ASSIGNMENT_QUERY,
  //     { id: taskAssignment.id, targetId: target.id },
  //     { user: { id: user.id } }
  //   );
  //   debugResponse(response);
  //   expect(response.data.taskAssignment.available.available).toEqual(false);
  // });

  // TEST IF DELETE RENDERS UNAVAIL
  test("deleted renders unavailable", async () => {
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
    await sq`task_assignments`
      .set({ active: false })
      .where({ id: taskAssignment.id });

    const response = await graphqlTestCall(
      GET_TASK_ASSIGNMENT_QUERY,
      { id: taskAssignment.id, targetId: target.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskAssignment.available.available).toEqual(false);
  });

  // TEST IF NOT BEFORE RENDERS UNAVAIL
  test("violation of not before date renders unavailable", async () => {
    const user = await createAdminUser();

    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });
    const form = await createTestForm(user.id);
    const taskDefinition = await createTestTaskDefinition(form.id, user.id);
    const taskAssignment = await createTestTaskAssignment(
      taskDefinition.id,
      team.id
    );
    await sq`task_assignments`
      .set({ notAvailableBeforeTs: sq.sql`now() + interval '1 day'` })
      .where({ id: taskAssignment.id });

    const response = await graphqlTestCall(
      GET_TASK_ASSIGNMENT_QUERY,
      { id: taskAssignment.id, targetId: target.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskAssignment.available.available).toEqual(false);
    expect(response.data.taskAssignment.notAvailableBeforeTs).not.toBeNull();
    expect(response.data.taskAssignment.notAvailableAfterTs).toBeNull();
  });
  // TEST IF NOT AFTER RENDERS UNAVAIL
  test("violation of not after date renders unavailable", async () => {
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
    await sq`task_assignments`
      .set({ notAvailableAfterTs: sq.sql`now() - interval '1 day'` })
      .where({ id: taskAssignment.id });

    const response = await graphqlTestCall(
      GET_TASK_ASSIGNMENT_QUERY,
      { id: taskAssignment.id, targetId: target.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskAssignment.available.available).toEqual(false);
    expect(response.data.taskAssignment.notAvailableBeforeTs).toBeNull();
    expect(response.data.taskAssignment.notAvailableAfterTs).not.toBeNull();
  });

  test("A task dependency will make unavailable if not completed", async () => {
    const user = await createAdminUser();

    const team = await createTestTeam();
    createTestTeamPermission(user.id, team.id, "TRAINING");
    const form = await createTestForm(user.id);
    const taskDefinition1 = await createTestTaskDefinition(form.id, user.id);
    const taskDefinition2 = await createTestTaskDefinition(form.id, user.id);
    const taskAssignmentParent = await createTestTaskAssignment(
      taskDefinition1.id,
      team.id,
      {
        MEMBER: true
      }
    );

    const taskAssignmentChild = await createTestTaskAssignment(
      taskDefinition2.id,
      team.id,
      {
        MEMBER: true
      }
    );

    const target = await createTestTarget({ userId: user.id, teamId: team.id });

    await sq`task_assignments`
      .set({ notUntilCompletionOf: taskAssignmentParent.id })
      .where({ id: taskAssignmentChild.id });

    await sq`task_assignment_status`.insert({
      targetId: target.id,
      taskAssignmentId: taskAssignmentParent.id,
      completedBy: user.id,
      complete: false
    });

    const response = await graphqlTestCall(
      GET_TASK_ASSIGNMENT_QUERY,
      { id: taskAssignmentChild.id, targetId: target.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskAssignment.available.available).toEqual(false);
  });

  test("a task assignment should load a nested form value", async () => {
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
    const formValue = await createTestFormValue(
      form.id,
      user.id,
      target.id,
      form.fields[0].name
    );

    const response = await graphqlTestCall(
      GET_TASK_ASSIGNMENT_QUERY,
      { id: taskAssignment.id, targetId: target.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskAssignment.definition.form).not.toBeNull();
    expect(
      response.data.taskAssignment.definition.form.fields[0].value
    ).toEqual(formValue.value);
    expect(
      response.data.taskAssignment.definition.form.fields[1].value
    ).toBeNull();
  });

  test("a task assignment should report completion status", async () => {
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
      GET_TASK_ASSIGNMENT_QUERY,
      { id: taskAssignment.id, targetId: target.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskAssignment.complete).toBe(false);

    await sq`task_assignment_status`.insert({
      targetId: target.id,
      taskAssignmentId: taskAssignment.id,
      completedBy: user.id,
      complete: true
    });

    const response2 = await graphqlTestCall(
      GET_TASK_ASSIGNMENT_QUERY,
      { id: taskAssignment.id, targetId: target.id },
      { user: { id: user.id } }
    );
    debugResponse(response2);
    expect(response2.data.taskAssignment.complete).toBe(true);
  });

  // TEST IF DELETE RENDERS UNAVAIL
  test("sortValue is returned", async () => {
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
    await sq`task_assignments`
      .set({ sortValue: 2 })
      .where({ id: taskAssignment.id });

    const response = await graphqlTestCall(
      GET_TASK_ASSIGNMENT_QUERY,
      { id: taskAssignment.id, targetId: target.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskAssignment.sortValue).toEqual(2);
  });

  test("Field supplemental fields works ", async () => {
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

    const supplementalFields = [
      {
        label: "I am the label text",
        type: "text",
        name: "testingSupplemental"
      }
    ];

    await sq`task_assignments`
      .set({ supplementalFields: JSON.stringify(supplementalFields) })
      .where({ id: taskAssignment.id });

    // test form value carries over
    const formValue = await createTestFormValue(
      form.id,
      user.id,
      target.id,
      supplementalFields[0].name
    );

    const response = await graphqlTestCall(
      GET_TASK_ASSIGNMENT_QUERY,
      { id: taskAssignment.id, targetId: target.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskAssignment.id).toEqual(taskAssignment.id);
    expect(response.data.taskAssignment.supplementalFields.length).toBe(1);
    expect(
      _.omit(response.data.taskAssignment.supplementalFields[0], "value")
    ).toEqual(supplementalFields[0]);

    expect(response.data.taskAssignment.supplementalFields[0].value).toEqual(
      formValue.value
    );
  });
});
