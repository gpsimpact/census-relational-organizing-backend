import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestTeam,
  createAdminUser,
  createTestTaskDefinition,
  createTestForm,
  createTestUser
} from "../utils/createTestEntities";
import { sq } from "../db";

const DESGINATE_TEAM_ELIGIBLE_TASK_DEFINITION = `
mutation designateTeamEligibleTask($input: DesignateTeamEligibleTaskInput!) {
    designateTeamEligibleTask(input: $input) {
      code
      success
      message
      item {
        id
        form {
          id
          fields {
            name
          }
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

    const team = await createTestTeam();

    const formA = await createTestForm(user.id);
    const taskDefinition = await createTestTaskDefinition(formA.id, user.id);

    const response = await graphqlTestCall(
      DESGINATE_TEAM_ELIGIBLE_TASK_DEFINITION,
      {
        input: {
          teamId: team.id,
          taskDefinitionId: taskDefinition.id,
          eligible: true
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.designateTeamEligibleTask.item.id).toEqual(
      taskDefinition.id
    );

    const dbCheck = await sq`team_eligible_task_definitions`.where({
      teamId: team.id,
      taskDefinitionId: taskDefinition.id
    });

    expect(dbCheck.length).toBe(1);

    // verify double apply true works

    const response2 = await graphqlTestCall(
      DESGINATE_TEAM_ELIGIBLE_TASK_DEFINITION,
      {
        input: {
          teamId: team.id,
          taskDefinitionId: taskDefinition.id,
          eligible: true
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response2);
    expect(response2.data.designateTeamEligibleTask.item.id).toEqual(
      taskDefinition.id
    );

    const dbCheck2 = await sq`team_eligible_task_definitions`.where({
      teamId: team.id,
      taskDefinitionId: taskDefinition.id
    });

    expect(dbCheck2.length).toBe(1);

    // verify false works

    const response3 = await graphqlTestCall(
      DESGINATE_TEAM_ELIGIBLE_TASK_DEFINITION,
      {
        input: {
          teamId: team.id,
          taskDefinitionId: taskDefinition.id,
          eligible: false
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response3);
    expect(response3.data.designateTeamEligibleTask.item.id).toEqual(
      taskDefinition.id
    );

    const dbCheck3 = await sq`team_eligible_task_definitions`.where({
      teamId: team.id,
      taskDefinitionId: taskDefinition.id
    });

    expect(dbCheck3.length).toBe(0);
  });

  test("Permission: Must be global admin ", async () => {
    const nonAdmin = await createTestUser();
    const admin = await createAdminUser();
    const team = await createTestTeam();

    const formA = await createTestForm(admin.id);
    const taskDefinition = await createTestTaskDefinition(formA.id, admin.id);

    const response = await graphqlTestCall(
      DESGINATE_TEAM_ELIGIBLE_TASK_DEFINITION,
      {
        input: {
          teamId: team.id,
          taskDefinitionId: taskDefinition.id,
          eligible: true
        }
      },
      { user: { id: nonAdmin.id } }
    );
    debugResponse(response);
    // expect(response.data.designateTeamEligibleTask).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
    const response2 = await graphqlTestCall(
      DESGINATE_TEAM_ELIGIBLE_TASK_DEFINITION,
      {
        input: {
          teamId: team.id,
          taskDefinitionId: taskDefinition.id,
          eligible: true
        }
      },
      { user: { id: admin.id } }
    );
    debugResponse(response2);
    expect(response2.data.designateTeamEligibleTask.success).toBe(true);
  });

  test("must pass real ids in input", async () => {
    const user = await createAdminUser();

    const team = await createTestTeam();

    const formA = await createTestForm(user.id);
    const taskDefinition = await createTestTaskDefinition(formA.id, user.id);

    const response = await graphqlTestCall(
      DESGINATE_TEAM_ELIGIBLE_TASK_DEFINITION,
      {
        input: {
          teamId: "29e4dd44-d220-4667-b194-1c5687063191",
          taskDefinitionId: taskDefinition.id,
          eligible: true
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.designateTeamEligibleTask).toEqual({
      code: "DOES_NOT_EXIST",
      success: false,
      message: "No team with this id exists",
      item: null
    });

    const response2 = await graphqlTestCall(
      DESGINATE_TEAM_ELIGIBLE_TASK_DEFINITION,
      {
        input: {
          teamId: team.id,
          taskDefinitionId: "29e4dd44-d220-4667-b194-1c5687063191",
          eligible: true
        }
      },
      { user: { id: user.id } }
    );
    debugResponse(response2);
    expect(response2.data.designateTeamEligibleTask).toEqual({
      code: "DOES_NOT_EXIST",
      success: false,
      message: "No task definition with this id exists",
      item: null
    });
  });
});
