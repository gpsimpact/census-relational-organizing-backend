require("dotenv").config();

import { sq } from "../db";
import { dbUp } from "../utils/testDbOps";
import {
  createTestTarget,
  createTestTeam,
  createTestUser
} from "../utils/createTestEntities";
import targetTractUpdate from "./targetTractUpdate";

beforeEach(async () => {
  await dbUp();
});

describe("message function target Census tract update", () => {
  test("Happy Path ", async () => {
    const user = await createTestUser();
    const team = await createTestTeam();
    const target = await createTestTarget({ teamId: team.id, userId: user.id });

    const mockMessage = {
      data: "TARGET_TRACT_UPDATE",
      attributes: {
        targetId: target.id,
        tract_geoid: "AAAAAAAAA",
        tract_centlat: "22.44",
        tract_centlon: "19.88",
        tract_state: "KS",
        tract_name: "The Best Tract",
        tract_county: "Dope County"
      }
    };
    mockMessage.ack = jest.fn();
    await targetTractUpdate(mockMessage);

    const [dbTarget] = await sq.from`targets`.where({ id: target.id });
    expect(dbTarget).toBeDefined();
    expect(dbTarget.censusTract).toEqual("AAAAAAAAA");
    expect(mockMessage.ack).toHaveBeenCalled();
  });
});
