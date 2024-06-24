import { WebClient } from '@slack/web-api';
import { Actor, ApifyClient, log } from 'apify';
import { pagesListMsgBlocks, reportMsgBlocks } from './slack_msg_blocks.js';

await Actor.init();

/**
 * INPUT HANDLING
 */

interface Input {
    payload: any;
    keyValueStoreId: string;
    keyValueStoreRecordName: string;
    token: string;
    channel: string;
}
const input = await Actor.getInput<Input>();
if (!input) throw new Error("Input is missing!");

const { payload, keyValueStoreId, keyValueStoreRecordName, token, channel } = input;
if (!token) throw new Error("Slack token is missing!");
if (!channel) throw new Error("Slack channel is missing!");

if (keyValueStoreId) {
	log.info(`A Key-Value Store ID was passed as input: using ID ${keyValueStoreId} to access resources`);
}
const keyValueStoreToProcess = keyValueStoreId || payload?.resource?.defaultKeyValueStoreId;
if (!keyValueStoreToProcess) throw new Error("Key-Value Store ID is missing!");
if (!keyValueStoreRecordName) throw new Error("Key-Value Store needs a record name to extract the correct data!");

if (payload && payload.eventData) {
	log.info(`Found a previous actor run with ID ${payload.eventData.actorRunId}`);
	log.info(`Found associated Key-Value Store ID ${payload?.resource?.defaultKeyValueStoreId}`);
	if (keyValueStoreId) {
		log.info(`A Key-Value Store ID was passed as input. If you want to use the Key-Value Store ID from the previous run, remove the Key-Value Store ID from the inputs.`);
	}
}

/**
 * GET THE DATA
 */

const apifyClient = new ApifyClient();

const keyValueStore = apifyClient.keyValueStore(keyValueStoreToProcess);
const record = await keyValueStore.getRecord(keyValueStoreRecordName);
//@ts-ignore
const scores = record?.value?.lighthouseResults?.scores;
//@ts-ignore
const successfulRequests = record?.value?.lighthouseResults?.successfulPages;
//@ts-ignore
const finishedRequests = record?.value?.requestsFinished;
const runUrl = payload && payload.eventData && `https://console.apify.com/view/runs/${payload.eventData.actorRunId}`

/**
 * SEND THE MESSAGE
 */

const web = new WebClient(token);

const result = await web.chat.postMessage({
    channel,
    text: 'A Lighthouse Analysis report is waiting for you',
    blocks: reportMsgBlocks(scores, finishedRequests, runUrl)
});

log.info(`Successfully sent message ${result.ts} in channel ${channel}`);

const resultInThread = await web.chat.postMessage({
    channel,
    thread_ts: result.ts,
    text: 'A Lighthouse Analysis report is waiting for you',
    blocks: pagesListMsgBlocks(successfulRequests)
});

log.info(`Successfully sent message ${resultInThread.ts} in thread ${result.ts} in channel ${channel}`);

/**
 * CLEANUP
 */

await Actor.setValue('OUTPUT', result);
await Actor.exit();
