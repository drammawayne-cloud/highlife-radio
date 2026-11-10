import { readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const credentialsPath = process.env.HIGHLIFE_ANDROID_SIGNING_FILE || resolve(homedir(), '.config/nyc-highlife-radio/android/upload-signing.json');
if ((statSync(credentialsPath).mode & 0o077) !== 0) throw Error('Android signing file must be private (mode 600).');
const signing = JSON.parse(readFileSync(credentialsPath, 'utf8'));
for (const field of ['storeFile', 'storePassword', 'keyAlias', 'keyPassword']) {
  if (!signing[field]) throw Error(`Missing private Android signing field: ${field}`);
}
const env = { ...process.env, ANDROID_HOME: process.env.ANDROID_HOME || resolve(homedir(), 'Library/Android/sdk'), HIGHLIFE_UPLOAD_STORE: signing.storeFile, HIGHLIFE_UPLOAD_STORE_PASSWORD: signing.storePassword, HIGHLIFE_UPLOAD_ALIAS: signing.keyAlias, HIGHLIFE_UPLOAD_KEY_PASSWORD: signing.keyPassword };
function run(command,args,cwd) {
 const result=spawnSync(command,args,{cwd,env,stdio:'inherit'});
 if(result.error) throw result.error;
 if(result.status!==0) process.exit(result.status || 1);
}
run('npx',['expo','prebuild','--platform','android','--no-install'],project);
run('./gradlew',[':app:bundleRelease',':app:assembleRelease','--console=plain','--no-daemon','-PreactNativeArchitectures=arm64-v8a,x86_64'],resolve(project,'android'));
