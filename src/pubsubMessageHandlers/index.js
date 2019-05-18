import targetTractUpdate from "./targetTractUpdate";

const aExampleFunc = message => {
  // do stuff

  // must ack if successful
  message.ack();
};

export default message => {
  // string interp necessary to convert from buffer
  const TYPE = `${message.data}`;

  switch (TYPE) {
    case "A": {
      aExampleFunc(message);
      break;
    }
    case "TARGET_TRACT_UPDATE": {
      targetTractUpdate(message);
      break;
    }
    default: {
      break;
    }
  }
  // assumes message structure of
  // {type: "FUNC_TO_PROCESS", payload: {}}
  //   console.log(`Received message ${message.id}:`);
  //   console.log(`\tData: ${message.data}`);
  //   console.log(`\tAttributes: ${JSON.stringify(message.attributes)}`);
  //   // "Ack" (acknowledge receipt of) the message
  // temporarily ack them. This should be moved into processor
  //   message.ack();
};
