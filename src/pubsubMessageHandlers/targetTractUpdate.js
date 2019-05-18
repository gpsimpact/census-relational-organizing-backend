import { sq } from "../db";
import { logger } from "../index";

export default async message => {
  if (
    message.attributes &&
    message.attributes.targetId &&
    message.attributes.censusTract
  ) {
    await sq`targets`
      .set({ censusTract: message.attributes.censusTract })
      .where({ id: message.attributes.targetId });
    message.ack();
  } else {
    // might as well clear because its malformed ?
    logger.bug(
      Object.assign(
        {},
        {
          pubSubMessage: message,
          message: "MALFORMED TARGET_TRACT_UPDATE pubsub event"
        }
      )
    );
    message.ack();
  }
};
