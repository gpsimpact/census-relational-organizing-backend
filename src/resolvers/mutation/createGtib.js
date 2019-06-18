export default async (root, { input }, context) => {
  const data = Object.assign({}, input, {
    userId: context.user.id,
    isGlobal: true
  });

  const dbData = await context.dataSource.tib.create(data);

  return {
    code: "OK",
    message: "GTIB has been created.",
    item: dbData,
    success: true
  };
};
