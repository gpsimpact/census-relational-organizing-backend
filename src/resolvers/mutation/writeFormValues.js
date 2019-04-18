export default async (root, { input }, { sq }) => {
  // do insert via transaction to make it an all or nothing thing
  let success = false;
  let code;
  let message;
  const trx = await sq.transaction();
  try {
    await sq
      .from("form_values")
      .insert(input.data)
      .all(trx);
    await trx.commit();
    success = true;
    code = "OK";
    message = "All values have been written.";
  } catch (error) {
    // console.log("ERROR", error);
    await trx.rollback();
    code = "INPUT_ERROR";
    message = "No values were written. Check your inputs.";
  }

  return {
    success,
    code,
    message
  };
};
