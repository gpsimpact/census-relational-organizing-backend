// import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestTeam,
  createAdminUser,
  createTestTarget,
  createTestTaskDefinition,
  createTestTaskAssignment,
  createTestForm
} from "../utils/createTestEntities";
import { sq } from "../db";

const OP = `
query summaryCountAllTeamTasks($teamId: String!) {
  summaryCountAllTeamTasks(teamId: $teamId) {
    languageVariations {
      title
      language
    }
    countComplete
    teamTargetsCount
  }
}
`;

beforeEach(async () => {
  await dbUp();
});

afterAll(async () => {
  await dbDown();
});

describe("Summary Count all team tasks", () => {
  test("Happy Path", async () => {
    const user = await createAdminUser();
    const team = await createTestTeam();

    const target = await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTarget({ userId: user.id, teamId: team.id });

    const formA = await createTestForm(user.id);

    // create spanish version
    const formA_ES = Object.assign({}, formA, {
      language: "ES",
      title: `${formA.title} - ES`,
      fields: JSON.stringify(formA.fields)
    });
    await sq`forms`.insert(formA_ES);

    const taskDefinitionA = await createTestTaskDefinition(formA.id, user.id);
    const taskAssignmentA = await createTestTaskAssignment(
      taskDefinitionA.id,
      team.id,
      {
        MEMBER: true
      }
    );

    await sq`task_assignment_status`.insert({
      targetId: target.id,
      taskAssignmentId: taskAssignmentA.id,
      completedBy: user.id,
      complete: true
    });

    const response = await graphqlTestCall(
      OP,
      { teamId: team.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.summaryCountAllTeamTasks.length).toEqual(1);
    expect(response.data.summaryCountAllTeamTasks[0]).toEqual({
      languageVariations: [
        {
          title: "This is form title",
          language: "EN"
        },
        {
          title: "This is form title - ES",
          language: "ES"
        }
      ],
      countComplete: 1,
      teamTargetsCount: 2
    });
  });

  test("Null case", async () => {
    const user = await createAdminUser();
    const team = await createTestTeam();

    const formA = await createTestForm(user.id);

    // create spanish version
    const formA_ES = Object.assign({}, formA, {
      language: "ES",
      title: `${formA.title} - ES`,
      fields: JSON.stringify(formA.fields)
    });
    await sq`forms`.insert(formA_ES);

    const taskDefinitionA = await createTestTaskDefinition(formA.id, user.id);
    await createTestTaskAssignment(taskDefinitionA.id, team.id, {
      MEMBER: true
    });

    const response = await graphqlTestCall(
      OP,
      { teamId: team.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.summaryCountAllTeamTasks.length).toEqual(1);
    expect(response.data.summaryCountAllTeamTasks[0]).toEqual({
      languageVariations: [
        {
          title: "This is form title",
          language: "EN"
        },
        {
          title: "This is form title - ES",
          language: "ES"
        }
      ],
      countComplete: 0,
      teamTargetsCount: 0
    });
  });
});
