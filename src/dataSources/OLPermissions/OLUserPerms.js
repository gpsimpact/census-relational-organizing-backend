import nestCPbyUserClient from "./transform_OLUserPermsFormat";

export default olPermsByUserIdLoader => async userId => {
  if (!userId) {
    return [null];
  }
  const cps = await olPermsByUserIdLoader.load(userId);
  const transformed = nestCPbyUserClient(cps);
  return transformed[userId];
};
