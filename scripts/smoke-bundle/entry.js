// Importing the whole public API forces every chunk and dependency to be linked
import * as sdk from "../../dist/index.mjs";

console.log(Object.keys(sdk).length);
