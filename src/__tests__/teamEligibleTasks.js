import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestTeam,
  createAdminUser,
  createTestTaskDefinition,
  createTestForm,
  createTestUser,
  createTestTeamPermission
} from "../utils/createTestEntities";
import { sq } from "../db";

const GET_TEAM_ELIGIBLE_TASKS_QUERY = `
query teamEligibleTasks($input: TeamEligibleTasksInput!) {
    teamEligibleTasks(input: $input) {
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

    const team = await createTestTeam();

    const formA = await createTestForm(user.id);
    const globalTaskDefinition = await createTestTaskDefinition(
      formA.id,
      user.id
    );

    await sq`task_definitions`
      .set({ isGloballyAvailable: true })
      .where({ id: globalTaskDefinition.id });

    const formB = await createTestForm(user.id);
    const elgibleTaskDefinition = await createTestTaskDefinition(
      formB.id,
      user.id
    );

    await sq`team_eligible_task_definitions`.insert({
      teamId: team.id,
      taskDefinitionId: elgibleTaskDefinition.id
    });

    const formC = await createTestForm(user.id);
    const nonElgibleTaskDefinition = await createTestTaskDefinition(
      formC.id,
      user.id
    );

    const response = await graphqlTestCall(
      GET_TEAM_ELIGIBLE_TASKS_QUERY,
      { input: { teamId: team.id } },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.teamEligibleTasks.length).toEqual(2);
    const globalResponse = _.find(response.data.teamEligibleTasks, x => {
      return (x.id = globalTaskDefinition.id);
    });
    const eligibleResponse = _.find(response.data.teamEligibleTasks, x => {
      return (x.id = elgibleTaskDefinition.id);
    });
    const nonEligibleResponse = _.find(response.data.teamEligibleTasks, x => {
      return (x.id = nonElgibleTaskDefinition.id);
    });

    expect(globalResponse).not.toBeNull();
    expect(eligibleResponse).not.toBeNull();
    expect(nonEligibleResponse).not.toBeNull();
  });

  test("Permission: Must be admin of team to read", async () => {
    const nonAdmin = await createTestUser();
    const teamAdmin = await createTestUser();
    const team = await createTestTeam();

    await createTestTeamPermission(teamAdmin.id, team.id, "ADMIN");

    const formA = await createTestForm(teamAdmin.id);
    const globalTaskDefinition = await createTestTaskDefinition(
      formA.id,
      teamAdmin.id
    );

    await sq`task_definitions`
      .set({ isGloballyAvailable: true })
      .where({ id: globalTaskDefinition.id });

    const response = await graphqlTestCall(
      GET_TEAM_ELIGIBLE_TASKS_QUERY,
      { input: { teamId: team.id } },
      { user: { id: nonAdmin.id } }
    );
    debugResponse(response);
    expect(response.data.teamEligibleTasks).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
    const response2 = await graphqlTestCall(
      GET_TEAM_ELIGIBLE_TASKS_QUERY,
      { input: { teamId: team.id } },
      { user: { id: teamAdmin.id } }
    );
    debugResponse(response2);
    expect(response2.data.teamEligibleTasks.length).toBe(1);
  });
});
