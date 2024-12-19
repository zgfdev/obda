import os from 'os';
import path from 'path';
import { writeFile, readFile, appendFile } from 'node:fs/promises';
import { writeFileSync, readFileSync } from 'node:fs';

const debugInfo = true;
const debugVobose = true;

function oblog(msg1, msg2, msg3) {
  if (debugInfo) {
    console.log('oblog', msg1, msg2, msg3);
  }
}

function oblogVerbose(msg1, msg2, msg3) {
  if (debugVobose) {
    console.log('oblog.v', msg1, msg2, msg3);
  }
}

function setPathByOs(filenm = '') {
  let configPath = '';
  const osType = os.type();
  if (osType === 'Windows_NT') {
    configPath = path.resolve(process.cwd(), filenm);
  }
  if (osType === 'Linux') {
    configPath = path.resolve(process.execPath, '../', filenm);
  }
  if (osType === 'Darwin') {
    configPath = path.resolve(process.execPath, '../', filenm);
  }
  return configPath;
}
async function saveJSON(fileName, data) {
  appendFile(`./data/born/${fileName}.json`, JSON.stringify(data) + ',\n', function (err) {
    if (err) {
      return console.log('oblog', 'saveJSON.err', err);
    }
  });
}
async function saveLocalJSON(path, obj) {
  try {
    await writeFile(path, JSON.stringify(obj), { encoding: 'utf8' });
    return { desc: 'saveLocalJSON', status: 'ok' };
  } catch (err) {
    console.log('saveLocalJSON.err', err.message);
    return { desc: 'saveLocalJSON', status: 'err', msg: err.message.split(',')[0] };
  }
}
async function getLocalJSON(path) {
  try {
    const str = await readFile(path, { encoding: 'utf8' });
    return { desc: 'getLocalJSON', status: 'ok', result: JSON.parse(str) };
  } catch (err) {
    console.log('getLocalJSON.err', err.message);
    return { desc: 'getLocalJSON', status: 'err', msg: err.message.split(',')[0] }; //ENOENT: Error NO ENTry
  }
}
function getLocalJSONSync(path) {
  try {
    const str = readFileSync(path, { encoding: 'utf8' });
    return { desc: 'getLocalJSONSync', status: 'ok', result: JSON.parse(str) };
  } catch (err) {
    console.log('getLocalJSONSync.err', err.message);
    return { desc: 'getLocalJSONSync', status: 'err', msg: err.message.split(',')[0] };
  }
}
function getCurDateShort() {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  return `${year}${month}${day}`;
}
function getCurSecond() {
  const date = new Date();
  const hour = ('0' + date.getHours()).slice(-2);
  const minute = ('0' + date.getMinutes()).slice(-2);
  const second = ('0' + date.getSeconds()).slice(-2);
  return `${getCurDateShort()}${hour}${minute}${second}`;
}
function getFirstHalf(str) {
  const halfLength = str.length / 2;
  return str.substring(0, halfLength);
}
function timeoutPromise() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject('timeout 20s');
    }, 20000);
  });
}
export { oblog, oblogVerbose as oblogV, setPathByOs, saveJSON, saveLocalJSON, getLocalJSON, getLocalJSONSync, getCurDateShort, getCurSecond, getFirstHalf };
