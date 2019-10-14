import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTtib,
  createTestGtib,
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
        tibType
      }
      retainAddress
      censusTract
    }
}
`;

beforeEach(async () => {
  await dbUp();
});

afterAll(async () => {
  await dbDown();
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
    expect(response.data.target.retainAddress).toBe(true);
    expect(response.data.target.censusTract).toBe(null);
  });

  test("Gives Tract ", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });
    await sq.from`targets`.set`census_tract = ${"foo"}`.where({
      id: target.id
    });
    const response = await graphqlTestCall(
      GET_TARGET_QUERY,
      { id: target.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.target.id).toEqual(target.id);
    expect(response.data.target.retainAddress).toBe(true);
    expect(response.data.target.censusTract).toBe("foo");
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
    await createTestGtib(user.id);

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
    expect(response.data.target.tibs.length).toEqual(4);
    const activeTibs = _.filter(response.data.target.tibs, x => x.isApplied);
    expect(activeTibs.length).toBe(1);
    expect(activeTibs[0].id).toBe(tib1.id);
    expect(activeTibs[0].tibType).toBe("QUESTION");
  });
});
