export default redis => async (userId, token) => {
  await redis.set(token, userId, "EX", 60 * 60 * 24 * 1000);
  return true;
};
