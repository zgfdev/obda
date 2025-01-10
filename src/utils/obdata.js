import { patchLocalJSON, getLocalJSON } from '#utils/obfn.js';

const data={
  test: {
    path: 'data/test.json',
    status: null,
    data: []
  }
}
async function getTheJSON(key){
  const cdo=data[key];
  cdo.data=(await getLocalJSON(cdo.path))['result'];
  // cdo.status='ok';
  return cdo.data;
}

async function getLocalData(key){
  const cdo=data[key];
  return cdo.status?data[key].data:await getTheJSON(key);
}

export { getLocalData }
