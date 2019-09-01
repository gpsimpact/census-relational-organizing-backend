// import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTarget,
  createTestTeam,
  createTestTargetContactAttempt,
  createAdminUser
} from "../utils/createTestEntities";
// import { sq } from "../db";

const GET_TARGET_CONTACT_ATTEMPT_QUERY = `
query targetContactAttempt($id: String!) {
    targetContactAttempt(id: $id) {
        id
        createdAt
        updatedAt
        active
        target {
            id
        }
        createdBy {
            id
        }
        lastEditedBy {
            id
        }
        content
        disposition
        method
      }
    }
`;

beforeEach(async () => {
  await dbUp();
});

describe("TARGET Contact Attempt", () => {
  test("Happy Path ", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });
    const targetContactAttempt = await createTestTargetContactAttempt(
      user.id,
      target.id
    );
    const response = await graphqlTestCall(
      GET_TARGET_CONTACT_ATTEMPT_QUERY,
      { id: targetContactAttempt.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.targetContactAttempt.id).toEqual(
      targetContactAttempt.id
    );
    expect(response.data.targetContactAttempt.createdAt).toEqual(
      response.data.targetContactAttempt.updatedAt
    );
    expect(response.data.targetContactAttempt.active).toEqual(true);
    expect(response.data.targetContactAttempt.target.id).toEqual(target.id);
    expect(response.data.targetContactAttempt.createdBy.id).toEqual(user.id);
    expect(response.data.targetContactAttempt.lastEditedBy).toBeNull();
    expect(response.data.targetContactAttempt.content).toEqual(
      targetContactAttempt.content
    );
    expect(response.data.targetContactAttempt.disposition).toEqual(
      targetContactAttempt.disposition
    );
    expect(response.data.targetContactAttempt.method).toEqual(
      targetContactAttempt.method
    );
  });

  // test must be user's target
  test("user must own target", async () => {
    const user = await createTestUser();
    const realOwnerUser = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: realOwnerUser.id,
      teamId: team.id
    });
    const targetContactAttempt = await createTestTargetContactAttempt(
      realOwnerUser.id,
      target.id
    );
    const response = await graphqlTestCall(
      GET_TARGET_CONTACT_ATTEMPT_QUERY,
      { id: targetContactAttempt.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.targetContactAttempt).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("admins can read others", async () => {
    const user = await createTestUser();
    const admin = await createAdminUser();
    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: user.id,
      teamId: team.id
    });
    const targetContactAttempt = await createTestTargetContactAttempt(
      user.id,
      target.id
    );
    const response = await graphqlTestCall(
      GET_TARGET_CONTACT_ATTEMPT_QUERY,
      { id: targetContactAttempt.id },
      { user: { id: admin.id } }
    );
    debugResponse(response);
    expect(response.data.targetContactAttempt.id).toEqual(
      targetContactAttempt.id
    );
  });
});
