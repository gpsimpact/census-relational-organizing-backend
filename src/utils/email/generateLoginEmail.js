import { html, subject, text } from "./content/magicLogin";

export default (token, securityCode, email, nextPage) => {
  // construct url
  let url = `${process.env.FRONTEND_HOST}/confirm-login?token=${token}`;
  if (nextPage) {
    url = `${url}&nextPage=${nextPage}`;
  }

  // Email them that reset token
  const messageData = {
    from: process.env.EMAIL_SENDER,
    html: html(url, securityCode),
    subject: subject(),
    text: text(url, securityCode),
    to: email
  };

  return messageData;
};
