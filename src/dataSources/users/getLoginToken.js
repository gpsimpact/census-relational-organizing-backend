export default redis => async token => {
  const userId = await redis.get(token);
  await redis.del(token);
  return userId;
};
