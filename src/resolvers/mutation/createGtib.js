export default async (root, { input }, context) => {
  const data = Object.assign({}, input, {
    userId: context.user.id
  });

  const dbData = await context.dataSource.gtib.create(data);

  return {
    code: "OK",
    message: "GTIB has been created.",
    item: dbData,
    success: true
  };
};
