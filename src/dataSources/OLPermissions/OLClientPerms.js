import transform from "./transform_OLClientPermsFormat";

export default olPermsByClientIdLoader => async userId => {
  if (!userId) {
    return [null];
  }
  const cps = await olPermsByClientIdLoader.load(userId);
  const transformed = transform(cps);
  return transformed[userId];
};
