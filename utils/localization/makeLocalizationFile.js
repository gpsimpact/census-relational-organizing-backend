const csv = require("csvtojson");
const _ = require("lodash");
const fs = require("fs");

const csvFilePath = "./translations_20200213.csv";

async function main() {
  const data = await csv().fromFile(csvFilePath);
  const outFileES = {};
  const outFileEN = {};
  const outFileTL = {};
  const outFileZH = {};
  _.forEach(data, row => {
    const key = row.ENGLISH.replace(/[,'"\n]/g, "");
    outFileES[key] = row.ES;
    outFileTL[key] = row.TL;
    outFileZH[key] = row.ZH;
    outFileEN[key] = row.ENGLISH;
  });

  fs.writeFileSync(
    "locales/es/common.json",
    JSON.stringify(outFileES, null, "\t")
  );
  fs.writeFileSync(
    "locales/en/common.json",
    JSON.stringify(outFileEN, null, "\t")
  );
  fs.writeFileSync(
    "locales/tl/common.json",
    JSON.stringify(outFileTL, null, "\t")
  );
  fs.writeFileSync(
    "locales/zh/common.json",
    JSON.stringify(outFileZH, null, "\t")
  );
}

main();
