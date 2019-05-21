import targetTractUpdate from "./targetTractUpdate";

export default message => {
  // string interp necessary to convert from buffer
  const TYPE = `${message.data}`;
  console.log(TYPE, message.attributes);
  switch (TYPE) {
    case "TARGET_TRACT_UPDATE": {
      targetTractUpdate(message);
      break;
    }
    default: {
      // not a topic this app cares about so reject.
      message.nack();
      break;
    }
  }
};
