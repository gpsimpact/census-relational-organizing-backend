import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTtib,
  createTestTarget,
  createTestTeam
} from "../utils/createTestEntities";
import { sq } from "../db";

const GET_TARGET_QUERY = `
query target($id: String!) {
    target(id: $id) {
      id
      firstName
      lastName
      email
      address
      city
      state
      zip5
      phone
      twitterHandle
      facebookProfile
      householdSize
      tibs {
        id
        text
        isApplied
        appliedAt
      }
    }
}
`;

beforeEach(async () => {
  await dbUp();
});

describe("TARGET", () => {
  test("Happy Path ", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });
    const response = await graphqlTestCall(
      GET_TARGET_QUERY,
      { id: target.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.target.id).toEqual(target.id);
  });

  // test must be user's target
  test("user must own target", async () => {
    const user = await createTestUser();
    const user2 = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });
    const response = await graphqlTestCall(
      GET_TARGET_QUERY,
      { id: target.id },
      { user: { id: user2.id } }
    );
    debugResponse(response);
    expect(response.data.target).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  // test tibs
  test("active Tibs", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const tib1 = await createTestTtib(user.id, team.id);
    await createTestTtib(user.id, team.id);
    await createTestTtib(user.id, team.id);

    const target = await createTestTarget({ userId: user.id, teamId: team.id });

    await sq.from`target_true_tibs`.insert({
      tibId: tib1.id,
      targetId: target.id
    });

    const response = await graphqlTestCall(
      GET_TARGET_QUERY,
      { id: target.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.target.tibs.length).toEqual(3);
    const activeTibs = _.filter(response.data.target.tibs, x => x.isApplied);
    expect(activeTibs.length).toBe(1);
    expect(activeTibs[0].id).toBe(tib1.id);
  });
});
