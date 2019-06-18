export default async (root, { input }, context) => {
  const data = Object.assign({}, input, {
    userId: context.user.id
  });

  const dbData = await context.dataSource.tib.create(data);

  return {
    code: "OK",
    message: "TTIB has been created.",
    item: dbData,
    success: true
  };
};
