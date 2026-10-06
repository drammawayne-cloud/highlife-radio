import {test} from "node:test";
import assert from "node:assert/strict";
import {recoveryDecision,MAX_RETRIES} from "../src/recovery";
const state={wanted:true,playing:true,loaded:true,buffering:false,failed:false,ended:false,lastProgress:0,now:31000,attempts:0,retryAt:0};
test("manual pause never restarts an interrupted stream",()=>assert.equal(recoveryDecision({...state,wanted:false,failed:true}),"idle"));
test("remote pause and audio interruption are respected",()=>assert.equal(recoveryDecision({...state,playing:false}),"paused"));
test("stalled playback retries after thirty seconds",()=>{assert.equal(recoveryDecision(state),"retry");assert.equal(recoveryDecision({...state,now:29000}),"wait");});
test("loaded errors and ended live stream reconnect",()=>{assert.equal(recoveryDecision({...state,playing:false,failed:true,now:100}),"retry");assert.equal(recoveryDecision({...state,playing:false,ended:true,now:100}),"retry");});
test("backoff and retry cap prevent endless failed reconnects",()=>{assert.equal(recoveryDecision({...state,retryAt:40000}),"wait");assert.equal(recoveryDecision({...state,attempts:MAX_RETRIES}),"stop");});
