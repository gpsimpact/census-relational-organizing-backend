// import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestTeam,
  createAdminUser,
  createTestTaskDefinition,
  createTestTaskAssignment,
  createTestForm,
  createTestOLPermission,
  createTestUser
} from "../utils/createTestEntities";
import { sq } from "../db";

const GET_TASK_ASSIGNMENT_QUERY = `
query taskAssignment($id: String!) {
    taskAssignment(id: $id) {
        id
        definition {
          id
        }
        team {
          id
        }
        active
        available {
          available
          nonAvailableMessage
        }
        availableTo {
          role
          available
        }
      }
    }
`;

beforeEach(async () => {
  await dbUp();
});

describe("TARGET Contact Attempt", () => {
  test("Happy Path ", async () => {
    const user = await createAdminUser();
    // const user = await createTestUser();

    const team = await createTestTeam();
    // createTestOLPermission(user.id, team.id, "MEMBER");
    // createTestOLPermission(user.id, team.id, "TRAINING");
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
      { id: taskAssignment.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskAssignment.id).toEqual(taskAssignment.id);
    expect(response.data.taskAssignment.definition.id).toEqual(
      taskDefinition.id
    );
    expect(response.data.taskAssignment.team.id).toEqual(team.id);
    expect(response.data.taskAssignment.availableTo).toEqual([
      {
        role: "APPLICANT",
        available: false
      },
      {
        role: "TRAINING",
        available: false
      },
      {
        role: "ELEVATED",
        available: false
      },
      {
        role: "MEMBER",
        available: true
      },
      {
        role: "ADMIN",
        available: false
      },
      {
        role: "DENIED",
        available: false
      }
    ]);
    expect(response.data.taskAssignment.available.available).toEqual(true);
  });

  test("available if has permission ", async () => {
    const user = await createTestUser();

    const team = await createTestTeam();
    createTestOLPermission(user.id, team.id, "MEMBER");
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
      { id: taskAssignment.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskAssignment.available.available).toEqual(true);
  });

  test("not available if not has permission ", async () => {
    const user = await createTestUser();

    const team = await createTestTeam();
    createTestOLPermission(user.id, team.id, "TRAINING");
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
      { id: taskAssignment.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskAssignment.available.available).toEqual(false);
  });

  // TEST IF DELETE RENDERS UNAVAIL
  test("deleted renders unavailable", async () => {
    const user = await createAdminUser();

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
    await sq`task_assignments`
      .set({ active: false })
      .where({ id: taskAssignment.id });

    const response = await graphqlTestCall(
      GET_TASK_ASSIGNMENT_QUERY,
      { id: taskAssignment.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskAssignment.available.available).toEqual(false);
  });
  // TEST IF NOT BEFORE RENDERS UNAVAIL
  test("violation of not before date renders unavailable", async () => {
    const user = await createAdminUser();

    const team = await createTestTeam();
    createTestOLPermission(user.id, team.id, "TRAINING");
    const form = await createTestForm(user.id);
    const taskDefinition = await createTestTaskDefinition(form.id, user.id);
    const taskAssignment = await createTestTaskAssignment(
      taskDefinition.id,
      team.id,
      {
        MEMBER: true
      }
    );
    await sq`task_definitions`
      .set({ notAvailableBeforeTs: sq.sql`now() + interval '1 day'` })
      .where({ id: taskDefinition.id });

    const response = await graphqlTestCall(
      GET_TASK_ASSIGNMENT_QUERY,
      { id: taskAssignment.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskAssignment.available.available).toEqual(false);
  });
  // TEST IF NOT AFTER RENDERS UNAVAIL
  test("violation of not after date renders unavailable", async () => {
    const user = await createAdminUser();

    const team = await createTestTeam();
    createTestOLPermission(user.id, team.id, "TRAINING");
    const form = await createTestForm(user.id);
    const taskDefinition = await createTestTaskDefinition(form.id, user.id);
    const taskAssignment = await createTestTaskAssignment(
      taskDefinition.id,
      team.id,
      {
        MEMBER: true
      }
    );
    await sq`task_definitions`
      .set({ notAvailableAfter: sq.sql`now() - interval '1 day'` })
      .where({ id: taskDefinition.id });

    const response = await graphqlTestCall(
      GET_TASK_ASSIGNMENT_QUERY,
      { id: taskAssignment.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.taskAssignment.available.available).toEqual(false);
  });
});
