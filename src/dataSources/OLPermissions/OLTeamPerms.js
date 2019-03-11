import transform from "./transform_OLTeamPermsFormat";

export default olPermsByTeamIdLoader => async userId => {
  if (!userId) {
    return [null];
  }
  const cps = await olPermsByTeamIdLoader.load(userId);
  const transformed = transform(cps);
  return transformed[userId];
};
