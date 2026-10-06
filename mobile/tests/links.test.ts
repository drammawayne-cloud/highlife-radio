import {test} from "node:test";
import assert from "node:assert/strict";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
const queryString=require("query-string");
test("patched route decoder preserves unicode and array query parameters",()=>{
  const value=queryString.parse("artist=caf%C3%A9&tag[]=reggae&tag[]=soca",{arrayFormat:"bracket"});
  assert.equal(value.artist,"café");assert.deepEqual(value.tag,["reggae","soca"]);
});
test("patched decoder handles malformed percent input without exponential recursion",{timeout:1000},()=>{
  const malformed="%FF".repeat(1024);
  assert.equal(queryString.parse(`q=${malformed}`).q,malformed);
  assert.equal(queryString.parse("q=%").q,"%");
});
