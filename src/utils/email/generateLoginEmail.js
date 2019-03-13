export default (token, securityCode, email, nextPage) => {
  // construct url
  let magicLoginLink = `${
    process.env.FRONTEND_HOST
  }/confirm-login?token=${token}`;
  if (nextPage) {
    magicLoginLink = `${magicLoginLink}&nextPage=${nextPage}`;
  }

  const messageData = {
    to: email,
    from: process.env.EMAIL_SENDER,
    templateId: "d-5f6f76a515e14d5891ef944da9ad3c55",
    dynamic_template_data: {
      securityCode,
      magicLoginLink
    }
  };

  return messageData;
};
