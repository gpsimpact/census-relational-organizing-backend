import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestTeam,
  createAdminUser,
  createTestTarget,
  createTestTtib
} from "../utils/createTestEntities";
import { sq } from "../db";

const SUMMARY_COUNT_MY_TEAM_TIBS_QUERY = `
query summaryCountMyTeamTibs($teamId: String!) {
  summaryCountMyTeamTibs(teamId: $teamId) {
    id
    text
    appliedCount
    unappliedCount
    tibType
  }
}
`;

beforeEach(async () => {
  await dbUp();
});

describe("Summary Count all teams", () => {
  test("Happy Path", async () => {
    const user = await createAdminUser();
    const team = await createTestTeam();
    const target1 = await createTestTarget({
      userId: user.id,
      teamId: team.id
    });
    const target2 = await createTestTarget({
      userId: user.id,
      teamId: team.id
    });

    const tib1 = await createTestTtib(user.id, team.id);
    const tib2 = await createTestTtib(user.id, team.id);
    const tib3 = await createTestTtib(user.id, team.id);
    const tib4 = await createTestTtib(user.id, team.id);

    await sq`tibs`.set({ active: false }).where({ id: tib4.id });

    await sq.from`target_true_tibs`.insert([
      {
        tibId: tib1.id,
        targetId: target1.id
      },
      {
        tibId: tib1.id,
        targetId: target2.id
      },
      {
        tibId: tib2.id,
        targetId: target1.id
      }
    ]);

    const response = await graphqlTestCall(
      SUMMARY_COUNT_MY_TEAM_TIBS_QUERY,
      { teamId: team.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.summaryCountMyTeamTibs.length).toEqual(3);
    const tib1Response = _.find(
      response.data.summaryCountMyTeamTibs,
      x => x.id == tib1.id
    );
    const tib2Response = _.find(
      response.data.summaryCountMyTeamTibs,
      x => x.id == tib2.id
    );
    const tib3Response = _.find(
      response.data.summaryCountMyTeamTibs,
      x => x.id == tib3.id
    );
    const tib4Response = _.find(
      response.data.summaryCountMyTeamTibs,
      x => x.id == tib4.id
    );
    expect(tib1Response.appliedCount).toEqual(2);
    expect(tib1Response.unappliedCount).toEqual(0);
    expect(tib2Response.appliedCount).toEqual(1);
    expect(tib2Response.unappliedCount).toEqual(1);
    expect(tib3Response.appliedCount).toEqual(0);
    expect(tib3Response.unappliedCount).toEqual(2);
    expect(tib4Response).toBeUndefined();
  });
});
