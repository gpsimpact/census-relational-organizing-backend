import nestedTransform from "./nestedTransform";

test("it works", () => {
  const data = {
    args: {
      input: {
        email: "foo@bAr.com"
      },
      data: {
        email: "zoo@dAr.com"
      }
    }
  };

  const transformed = nestedTransform(data, "email", x => x.toLowerCase());
  expect(transformed.args.input.email).toEqual(
    data.args.input.email.toLowerCase()
  );
  expect(transformed.args.data.email).toEqual(
    data.args.data.email.toLowerCase()
  );
});
