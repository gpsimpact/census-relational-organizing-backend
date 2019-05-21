require("dotenv").config();

import { sq } from "../db";
// import { logger } from "../index";

export default async message => {
  if (
    message.attributes &&
    message.attributes.targetId &&
    message.attributes.tract_geoid
  ) {
    await sq`targets`
      .set({ censusTract: message.attributes.tract_geoid })
      .where({ id: message.attributes.targetId });
    // all went well, so ack the message to remove from queue.
    message.ack();
  } else {
    // It's malformed, so reject it.
    // Unless someone else picks it up, it will expire after 7 days
    message.nack();
  }
};
