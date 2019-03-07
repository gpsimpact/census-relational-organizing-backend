import { dbUp, dbDown } from "../../utils/testDbOps";
import { createTestUser } from "../../utils/createTestEntities";
import me from "./me";
import { singleLoaderGDS } from "@jakelowen/sqorn-graphql-filters";
import { sq } from "../../db";

const userByIdLoader = singleLoaderGDS(sq.from`users`, "id");

beforeEach(async () => {
  await dbUp();
});

afterEach(async () => {
  await dbDown();
});

describe("user dbHandle", () => {
  test("Happy path", async () => {
    const user = await createTestUser();
    expect(await me({ userId: user.id }, userByIdLoader)()).toEqual(user);
  });

  test("unAuthed returns null", async () => {
    expect(await me({}, userByIdLoader)()).toBeNull();
  });
});
