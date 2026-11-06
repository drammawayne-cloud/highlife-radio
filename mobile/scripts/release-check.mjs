import {readFileSync} from "node:fs";
const app=JSON.parse(readFileSync(new URL("../app.json",import.meta.url))).expo;
const metadata=JSON.parse(readFileSync(new URL("../release/metadata.json",import.meta.url)));
let privateInfo={};
try { privateInfo=JSON.parse(readFileSync(new URL("../release/private.json",import.meta.url))); } catch {}
const missing=[];
const https=value=>{try{return new URL(value).protocol==="https:";}catch{return false;}};
for(const key of ["supportUrl","privacyPolicyUrl"])if(!https(metadata[key]))missing.push(`${key}: a stable public HTTPS page is required`);
for(const key of ["reviewContactEmail","reviewContactPhone","appleTeamId","appStoreConnectAppId"])if(!privateInfo[key])missing.push(`${key}: account-holder information is required in local release/private.json`);
for(const key of ["rightsConfirmed","privacyPracticesConfirmed","ageRatingAnswersConfirmed","nativeDeviceTestsPassed","nativeScreenshotsCaptured","dependencyRiskReviewed"])if(metadata[key]!==true)missing.push(`${key}: not yet verified`);
if(!app.extra?.eas?.projectId)missing.push("EAS project is not linked to an authenticated Expo account");
console.log(`High Life Radio ${app.version} · ${app.ios.bundleIdentifier}`);
if(missing.length){console.log("App Store submission is blocked:\n"+missing.map(value=>`- ${value}`).join("\n"));process.exitCode=1;}
else console.log("Local release information is complete. Confirm the signed build, TestFlight results, screenshots and Apple account state before submission.");
