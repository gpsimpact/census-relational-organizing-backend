// import _ from "lodash";
import { graphqlTestCall, debugResponse } from "../utils/graphqlTestCall";
import { dbUp } from "../utils/testDbOps";
import {
  createTestUser,
  createTestTarget,
  createTestTeam,
  createTestTargetNote,
  createAdminUser
} from "../utils/createTestEntities";
// import { sq } from "../db";

const GET_TARGET_NOTE_QUERY = `
query targetNote($id: String!) {
    targetNote(id: $id) {
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
`;

beforeEach(async () => {
  await dbUp();
});

describe("TARGET", () => {
  test("Happy Path ", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ userId: user.id, teamId: team.id });
    const targetNote = await createTestTargetNote(user.id, target.id);
    const response = await graphqlTestCall(
      GET_TARGET_NOTE_QUERY,
      { id: targetNote.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.targetNote.id).toEqual(targetNote.id);
    expect(response.data.targetNote.createdAt).toEqual(
      response.data.targetNote.updatedAt
    );
    expect(response.data.targetNote.active).toEqual(true);
    expect(response.data.targetNote.target.id).toEqual(target.id);
    expect(response.data.targetNote.createdBy.id).toEqual(user.id);
    expect(response.data.targetNote.lastEditedBy).toBeNull();
    expect(response.data.targetNote.content).toEqual(targetNote.content);
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
    const targetNote = await createTestTargetNote(realOwnerUser.id, target.id);
    const response = await graphqlTestCall(
      GET_TARGET_NOTE_QUERY,
      { id: targetNote.id },
      { user: { id: user.id } }
    );
    debugResponse(response);
    expect(response.data.targetNote).toBeNull();
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
    const targetNote = await createTestTargetNote(user.id, target.id);
    const response = await graphqlTestCall(
      GET_TARGET_NOTE_QUERY,
      { id: targetNote.id },
      { user: { id: admin.id } }
    );
    debugResponse(response);
    expect(response.data.targetNote.id).toEqual(targetNote.id);
  });

});
