import { randomBytes } from "crypto";
import { promisify } from "util";

export default async length => {
  const randomBytesPromiseified = promisify(randomBytes);
  return (await randomBytesPromiseified(length)).toString("hex");
};
