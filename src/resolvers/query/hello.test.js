import hello from "./hello";
import { dbUp, dbDown } from "../../utils/testDbOps";

beforeEach(async () => {
  await dbUp();
});

afterAll(async () => {
  await dbDown();
});

describe("hello", () => {
  test("no args", async () => {
    const res = await hello(null, {}, null, null);
    expect(res).toEqual(`Hello World`);
  });

  test("With args", async () => {
    const name = "Jake";
    const res = await hello(null, { name }, null, null);
    expect(res).toEqual(`Hello ${name}`);
  });
});
