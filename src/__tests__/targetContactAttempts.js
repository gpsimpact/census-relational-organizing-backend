// import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  createTestTarget,
  createAdminUser,
  createTestTargetContactAttempt
} from "../utils/createTestEntities";

const GET_ALL_TARGET_CONTACT_ATTEMPTS = `
query targetContactAttempts($input:TargetContactAttemptsInput!) {
    targetContactAttempts(input:$input) {
        hasMore
        totalCount
        items {
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
}
`;

beforeEach(async () => {
  await dbUp();
});

afterAll(async () => {
  await dbDown();
});

describe("Target contact attempts", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });
    await createTestTargetContactAttempt(user.id, target.id);
    await createTestTargetContactAttempt(user.id, target.id);
    await createTestTargetContactAttempt(user.id, target.id);
    await createTestTargetContactAttempt(user.id, target.id);

    const response1 = await graphqlTestCall(
      GET_ALL_TARGET_CONTACT_ATTEMPTS,
      { input: { targetId: target.id } },
      { user: { id: user.id } }
    );
    debugResponse(response1);

    expect(response1.data.targetContactAttempts.hasMore).toBeFalsy();
    expect(response1.data.targetContactAttempts.totalCount).toBe(4);
    expect(response1.data.targetContactAttempts.items.length).toBe(4);
  });

  test("Cant query another user's target's contact attempts", async () => {
    const user = await createTestUser();
    const realOwnerUser = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: realOwnerUser.id,
      teamId: team.id
    });
    await createTestTargetContactAttempt(user.id, target.id);
    await createTestTargetContactAttempt(user.id, target.id);
    await createTestTargetContactAttempt(user.id, target.id);
    await createTestTargetContactAttempt(user.id, target.id);

    const response = await graphqlTestCall(
      GET_ALL_TARGET_CONTACT_ATTEMPTS,
      { input: { targetId: target.id } },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("Admins Can query another user's target's contact attempts", async () => {
    const user = await createTestUser();
    const admin = await createAdminUser();
    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: user.id,
      teamId: team.id
    });
    await createTestTargetContactAttempt(user.id, target.id);
    await createTestTargetContactAttempt(user.id, target.id);
    await createTestTargetContactAttempt(user.id, target.id);
    await createTestTargetContactAttempt(user.id, target.id);

    const response = await graphqlTestCall(
      GET_ALL_TARGET_CONTACT_ATTEMPTS,
      { input: { targetId: target.id } },
      { user: { id: admin.id } }
    );
    debugResponse(response);
    expect(response.data.targetContactAttempts.hasMore).toBeFalsy();
    expect(response.data.targetContactAttempts.totalCount).toBe(4);
    expect(response.data.targetContactAttempts.items.length).toBe(4);
  });
});
