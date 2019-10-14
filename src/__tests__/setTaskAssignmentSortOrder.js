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

// setTaskAssignmentSortOrder(
//   input: SetTaskAssignmentSortOrderInput!
// ): SetTaskAssignmentSortOrderResult!

const SET_TASK_ASSIGNMENT_SORT_ORDER_MUTATION = `
mutation setTaskAssignmentSortOrder($input: SetTaskAssignmentSortOrderInput! ) {
    setTaskAssignmentSortOrder(input: $input) {
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

describe("Set Task Assignment Sort Order", () => {
  test("Happy Path ", async () => {
    const user = await createAdminUser();
    const team = await createTestTeam();

    // make 3 test task assignments
    const formA = await createTestForm(user.id);
    const taskDefinitionA = await createTestTaskDefinition(formA.id, user.id);
    const taskAssignmentA = await createTestTaskAssignment(
      taskDefinitionA.id,
      team.id,
      {
        MEMBER: true
      }
    );

    // set taA sortValue as 0 so it comes first
    await sq`task_assignments`
      .where({
        id: taskAssignmentA.id
      })
      .set({ sortValue: 0 });

    const formB = await createTestForm(user.id);
    const taskDefinitionB = await createTestTaskDefinition(formB.id, user.id);
    const taskAssignmentB = await createTestTaskAssignment(
      taskDefinitionB.id,
      team.id,
      {
        MEMBER: true
      }
    );

    // set taA sortValue as 1 so it comes after A
    await sq`task_assignments`
      .where({
        id: taskAssignmentB.id
      })
      .set({ sortValue: 1 });

    const formC = await createTestForm(user.id);
    const taskDefinitionC = await createTestTaskDefinition(formC.id, user.id);
    const taskAssignmentC = await createTestTaskAssignment(
      taskDefinitionC.id,
      team.id,
      {
        MEMBER: true
      }
    );

    // set taA sortValue as 2 so it comes after B
    await sq`task_assignments`
      .where({
        id: taskAssignmentC.id
      })
      .set({ sortValue: 2 });

    const response = await graphqlTestCall(
      SET_TASK_ASSIGNMENT_SORT_ORDER_MUTATION,
      {
        input: {
          teamId: team.id,
          orderedTaskAssignmentIds: [taskAssignmentB.id, taskAssignmentA.id]
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);

    // verify order has now been swaped.
    expect(response.data.setTaskAssignmentSortOrder.success).toEqual(true);
    expect(response.data.setTaskAssignmentSortOrder.item[0].id).toEqual(
      taskAssignmentB.id
    );
    expect(response.data.setTaskAssignmentSortOrder.item[1].id).toEqual(
      taskAssignmentA.id
    );

    // verify C is not included.
    expect(response.data.setTaskAssignmentSortOrder.item.length).toEqual(2);

    // verify C is also now set inactive.
    const [dbCheck] = await sq`task_assignments`.where({
      id: taskAssignmentC.id
    });
    expect(dbCheck.active).toBe(false);
    expect(dbCheck.sortValue).toBeNull();
  });

  // perm check. Global admin and team admin
  test("Team Admin can ", async () => {
    const teamAdmin = await createTestUser();
    const team = await createTestTeam();
    await createTestTeamPermissionBit(teamAdmin.id, team.id, { ADMIN: true });

    const formA = await createTestForm(teamAdmin.id);
    const taskDefinitionA = await createTestTaskDefinition(
      formA.id,
      teamAdmin.id
    );
    const taskAssignmentA = await createTestTaskAssignment(
      taskDefinitionA.id,
      team.id,
      {
        MEMBER: true
      }
    );

    // set taA sortValue as 0 so it comes first
    await sq`task_assignments`
      .where({
        id: taskAssignmentA.id
      })
      .set({ sortValue: 0 });

    const formB = await createTestForm(teamAdmin.id);
    const taskDefinitionB = await createTestTaskDefinition(
      formB.id,
      teamAdmin.id
    );
    const taskAssignmentB = await createTestTaskAssignment(
      taskDefinitionB.id,
      team.id,
      {
        MEMBER: true
      }
    );

    // set taA sortValue as 1 so it comes after A
    await sq`task_assignments`
      .where({
        id: taskAssignmentB.id
      })
      .set({ sortValue: 1 });

    const response = await graphqlTestCall(
      SET_TASK_ASSIGNMENT_SORT_ORDER_MUTATION,
      {
        input: {
          teamId: team.id,
          orderedTaskAssignmentIds: [taskAssignmentB.id, taskAssignmentA.id]
        }
      },
      { user: { id: teamAdmin.id } }
    );
    debugResponse(response);

    // verify order has now been swaped.
    expect(response.data.setTaskAssignmentSortOrder.success).toEqual(true);
  });

  // // perm check. not normal user
  test("normal user cant ", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();

    const formA = await createTestForm(user.id);
    const taskDefinitionA = await createTestTaskDefinition(formA.id, user.id);
    const taskAssignmentA = await createTestTaskAssignment(
      taskDefinitionA.id,
      team.id,
      {
        MEMBER: true
      }
    );

    // set taA sortValue as 0 so it comes first
    await sq`task_assignments`
      .where({
        id: taskAssignmentA.id
      })
      .set({ sortValue: 0 });

    const formB = await createTestForm(user.id);
    const taskDefinitionB = await createTestTaskDefinition(formB.id, user.id);
    const taskAssignmentB = await createTestTaskAssignment(
      taskDefinitionB.id,
      team.id,
      {
        MEMBER: true
      }
    );

    // set taA sortValue as 1 so it comes after A
    await sq`task_assignments`
      .where({
        id: taskAssignmentB.id
      })
      .set({ sortValue: 1 });

    const response = await graphqlTestCall(
      SET_TASK_ASSIGNMENT_SORT_ORDER_MUTATION,
      {
        input: {
          teamId: team.id,
          orderedTaskAssignmentIds: [taskAssignmentB.id, taskAssignmentA.id]
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });
});
