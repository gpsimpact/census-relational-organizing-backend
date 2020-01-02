// import faker from "faker";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp, dbDown } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTeam,
  // createTestGlobalPerm,
  createTestTarget,
  createTestTargetNote,
  createAdminUser
} from "../utils/createTestEntities";

const GET_ALL_TARGET_NOTES_QUERY = `
query targetNotes($input:TargetNotesInput!) {
    targetNotes(input:$input) {
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

describe("Target Notes", () => {
  test("Happy Path", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });
    const target2 = await createTestTarget({
      userId: user.id,
      teamId: team.id
    });
    await createTestTargetNote(user.id, target.id);
    await createTestTargetNote(user.id, target.id);
    await createTestTargetNote(user.id, target.id);
    await createTestTargetNote(user.id, target.id);
    await createTestTargetNote(user.id, target2.id);

    const response1 = await graphqlTestCall(
      GET_ALL_TARGET_NOTES_QUERY,
      { input: { targetId: target.id } },
      { user: { id: user.id } }
    );
    debugResponse(response1);

    expect(response1.data.targetNotes.hasMore).toBeFalsy();
    expect(response1.data.targetNotes.totalCount).toBe(4);
    expect(response1.data.targetNotes.items.length).toBe(4);
  });

  test("Cant query another user's target's notes", async () => {
    const user = await createTestUser();
    const realOwnerUser = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: realOwnerUser.id,
      teamId: team.id
    });
    await createTestTargetNote(user.id, target.id);
    await createTestTargetNote(user.id, target.id);
    await createTestTargetNote(user.id, target.id);
    await createTestTargetNote(user.id, target.id);

    const response = await graphqlTestCall(
      GET_ALL_TARGET_NOTES_QUERY,
      { input: { targetId: target.id } },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data).toBeNull();
    expect(response.errors.length).toEqual(1);
    expect(response.errors[0].message).toEqual("Not Authorized!");
  });

  test("Admins Can query another user's target's notes", async () => {
    const user = await createTestUser();
    const admin = await createAdminUser();
    const team = await createTestTeam();
    const target = await createTestTarget({
      userId: user.id,
      teamId: team.id
    });
    await createTestTargetNote(user.id, target.id);
    await createTestTargetNote(user.id, target.id);
    await createTestTargetNote(user.id, target.id);
    await createTestTargetNote(user.id, target.id);

    const response = await graphqlTestCall(
      GET_ALL_TARGET_NOTES_QUERY,
      { input: { targetId: target.id } },
      { user: { id: admin.id } }
    );
    debugResponse(response);
    expect(response.data.targetNotes.hasMore).toBeFalsy();
    expect(response.data.targetNotes.totalCount).toBe(4);
    expect(response.data.targetNotes.items.length).toBe(4);
  });
});
