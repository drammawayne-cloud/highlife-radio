import {test} from "node:test";
import assert from "node:assert/strict";
import {parseLiveReports,newsLabel} from "../src/news";
const now=Date.parse("2026-11-10T23:00:00Z");
const report={videoId:"abcdefghijk",title:"A verified report",sourceId:"reuters",sourcePublisher:"Reuters",publishedAt:"2026-11-10T22:00:00Z"};
test("live report links are generated safely on the station site",()=>{
 const result=parseLiveReports({stories:[{...report,url:"https://evil.example/"}]},now);
 assert.equal(result[0].url,"https://nychighliferadio.com/news/world/#report-abcdefghijk");
 assert.match(newsLabel(result[0]),/Reuters/);
 assert.equal(result[0].kind,"video");
});
test("live reports reject unknown publishers, unsafe IDs, old and future reports",()=>{
 assert.deepEqual(parseLiveReports({stories:[{...report,sourcePublisher:"Unknown"},{...report,videoId:"../evil"},{...report,publishedAt:"2026-10-01T00:00:00Z"},{...report,publishedAt:"2027-01-01T00:00:00Z"}]},now),[]);
});
test("live reports deduplicate, date-sort and reserve room for both publishers",()=>{
 const stories=Array.from({length:5},(_,i)=>({...report,videoId:`abcdefghij${i}`}));
 stories.push({...report,videoId:"apcdefghijk",sourceId:"ap",sourcePublisher:"Associated Press",publishedAt:"2026-11-10T22:30:00Z"});
 const result=parseLiveReports({stories:[...stories,report,report]},now);
 assert.equal(result.length,4);assert.equal(result[0].source,"Associated Press");
 assert.equal(new Set(result.map(s=>s.url)).size,result.length);
});
