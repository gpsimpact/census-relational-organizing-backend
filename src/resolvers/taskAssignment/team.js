export default (root, args, context) =>
  context.dataSource.team.byIdLoader.load(root.teamId);
