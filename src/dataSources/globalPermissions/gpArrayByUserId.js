import { map } from "lodash";

export default globalPermissionsByUserIdLoader => async userId => {
  if (!userId) {
    return [null];
  }
  const gps = await globalPermissionsByUserIdLoader.load(userId);
  return map(gps, "permission");
};
