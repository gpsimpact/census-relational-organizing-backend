export default (root, args, context) => {
  if (root.lastEditedBy) {
    return context.dataSource.user.byIdLoader.load(root.lastEditedBy);
  }
  return null;
};
