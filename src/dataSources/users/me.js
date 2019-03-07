export default (session, byIdLoader) => async () => {
  if (!session.userId) {
    return null;
  }
  return byIdLoader.load(session.userId);
};
