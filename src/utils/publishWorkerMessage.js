export default async (qname, message) => {
    await rsmq.sendMessage(
        {
          qname: process.env.CENSUS_GEOCODE_QUEUE_NAME,
          message: JSON.stringify({
            address: "765 Ash St",
            city: "Lawrence",
            state: "KS",
            zip: "66044",
            targetId: "00864e3a-da19-4173-828b-295c34b6fb6e"
          }),
          delay: 0
        },
        err => {
          if (err) {
            console.error(err);
            return;
          }
        }
      );
}

rsmq.sendMessage(
    {
      qname: process.env.CENSUS_GEOCODE_QUEUE_NAME,
      message: JSON.stringify({
        address: "765 Ash St",
        city: "Lawrence",
        state: "KS",
        zip: "66044",
        targetId: "00864e3a-da19-4173-828b-295c34b6fb6e"
      }),
      delay: 0
    },
    err => {
      if (err) {
        console.error(err);
        return;
      }
    }
  );
  console.log("pushed new message into queue");