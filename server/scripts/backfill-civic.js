/**
 * One-off: classify fact-check records written before the CIVIC tag existed.
 *
 * Records created before the field was introduced have `civic: null`, and the
 * public feed treats "not false" as visible. That let genuinely off-topic rows
 * (a bare link, "where did that come from") sit on a page that only promises
 * civic checks. This walks those rows once, applies the same civic heuristic the
 * router falls back to, and writes a real boolean.
 *
 * Run: node scripts/backfill-civic.js   (or npm run backfill:civic)
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { civicHeuristic } from "../services/llmRouter.js";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI is not set.");
  process.exit(1);
}

await mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 });
const col = mongoose.connection.db.collection("factchecks");

const docs = await col.find({ civic: null }).project({ claim: 1 }).toArray();
console.log(`Classifying ${docs.length} record(s) with no CIVIC tag...`);

let civic = 0;
let nonCivic = 0;
const ops = docs.map((doc) => {
  const isCivic = civicHeuristic(doc.claim);
  if (isCivic) civic += 1;
  else nonCivic += 1;
  return { updateOne: { filter: { _id: doc._id }, update: { $set: { civic: isCivic } } } };
});

if (ops.length) await col.bulkWrite(ops, { ordered: false });
console.log(`Done. civic=${civic} non-civic=${nonCivic}`);
await mongoose.disconnect();
