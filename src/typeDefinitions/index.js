import * as path from "path";
import { typedefs } from "@jakelowen/sqorn-graphql-filters";
import { fileLoader, mergeTypes } from "merge-graphql-schemas";

const typesArray = fileLoader(path.join(__dirname, "./"));

// Load in sqorn-graphql-filter types
typesArray.push(typedefs);

const typesMerged = mergeTypes(typesArray);

export default typesMerged;
