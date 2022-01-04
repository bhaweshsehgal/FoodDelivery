import { setupDao, tearDownDao } from './util.mjs'
import params from '../src/params.mjs';

import fs from 'fs';

import chai from 'chai';
const { assert } = chai;

const COURSE_DIR = `${process.env.HOME}/cs544`;
const DATA_PATH = `${COURSE_DIR}/data/chow-down1.json`;
const DATA = readJson(DATA_PATH);

describe('eateries DAO', function() {

  let dao;

  beforeEach(async () => {
    dao = await setupDao();
    await dao.loadEateries(DATA);
  });

  afterEach(async () => {
    await tearDownDao(dao);
  });

  it ('must find Chinese cuisine', async function () {
    const results = await dao.locateEateries('Chinese');
    assert.equal(results.length, 5);
  });

  it ('must find all Chinese cuisine', async function () {
    const results = await dao.locateEateries('Chinese', params.bingLoc,
					     0, 100 );
    assert.equal(results.length, 19);
  });

  it ('must find cuisine sorted by dist', async function () {
    const results = await dao.locateEateries('indian');
    assert.isAbove(results?.length, 0);
    assert(results.every((r, i, res) => i === 0 || r.dist >= res[i - 1].dist));
  });

  it ('must find cuisine irrespective of case', async function () {
    const results = await dao.locateEateries('aMeRIcaN');
    assert.isAbove(results?.length, 0);
  });

  it ('must return empty list for non-existent cuisine', async function () {
    const results = await dao.locateEateries('italian');
    assert.equal(results.length, 0);
  });

  it ('must get overlapped eateries list correctly', async function () {
    const results0 = await dao.locateEateries('mexican');
    assert.isAbove(results0?.length, 0);
    const results1 = await dao.locateEateries('mexican', params.bingLoc, 2);
    assert.equal(results0[2].id, results1[0].id);
  });

  it ('must find eatery by id', async function () {
    const results = await dao.locateEateries('Chinese');
    const id = results[0].id;
    const eatery = await dao.getEatery(id);
    assert.equal(eatery.id, id);
    assert(eatery.menu);
  });

  it ('must verify eatery has requested cuisine', async function () {
    const CUISINE = 'chinese';
    const results = await dao.locateEateries(CUISINE);
    for (const r of results) {
      const id = r.id;
      const eatery = await dao.getEatery(id);
      assert.equal(eatery.cuisine.toLowerCase(), CUISINE);
    }
  });

  it ('must return NOT_FOUND error with bad eatery id', async function () {
    const id = '0';
    const eatery = await dao.getEatery(id);
    assert.isAbove(eatery.errors?.length, 0);
    assert.equal(eatery.errors[0].code, 'NOT_FOUND');
  });
	
  //MyTestCases 
//Test Case for new-order
 it ('length of result must be greater after insertion', async function () {
    const eid=0;
    const eatery = await dao.newOrder(eid);
    const results = await dao.newOrder('127');
   // console.log(eatery);
    //console.log(results);
    assert(eatery.length>0);
   
  });
  it ('length of result must be greater after insertion', async function () {
    const results = await dao.newOrder('127');
   // console.log(results);
    assert(results.length > 0);
  });
  //Test for getorder
    it ('must return not found', async function () {
    const eatery = await dao.getOrder(122);
    assert.equal(eatery._errors?.[0]?.code, undefined);
   });
  it ('must return not found', async function () {
    let id=122;
    const neworder= await dao.newOrder(122);
    const eatery = await dao.getOrder(neworder[0]._id);
   // console.log(eatery[0].eateryID);
    assert.equal(eatery[0].eateryID,id);
   });
  //remove-order
   it ('eatery mot found', async function () {
    const id=111;
    const eatery = await dao.newOrder(id);
   // console.log(eatery[0]._id);
    const removeOrd= await dao.removeOrder(eatery[0]._id);
    const myeatery= await dao.getOrder(eatery[0]._id);
    assert.isAbove(myeatery.errors?.length, 0);
    assert.equal(myeatery.errors[0].code, 'NOT_FOUND');
  }); 
   //edit-order-addtion
   it ('eatery mot found', async function () {
    const id=287;
    const eatery = await dao.newOrder(id);
    //console.log(eatery[0]._id);
    const eatery1= await dao.editOrder(eatery[0]._id,'some-item-id',4);
    const eatery2= await dao.editOrder(eatery[0]._id,'some-item-id',4);
    const eatery3= await dao.editOrder(eatery[0]._id,'some-more-item-id',4);
    console.log();
    assert.equal(Object.values(eatery3[0].items)[0],8);
   });
  it ('eatery mot found', async function () {
    const id=287;
    const eatery = await dao.newOrder(id);
    //console.log(eatery[0]._id);
    const eatery1= await dao.editOrder(eatery[0]._id,'some-item-id',4);
    const eatery2= await dao.editOrder(eatery[0]._id,'some-item-id',4);
    const eatery3= await dao.editOrder(eatery[0]._id,'some-more-item-id',4);
    const eatery4= await dao.editOrder(eatery[0]._id,'some-more-item-id',-4);
    const eatery5= await dao.editOrder(eatery[0]._id,'some-item-id',-2);
    //console.log();
    assert.equal((eatery4[0].items)[1], undefined);
    assert.equal(Object.values(eatery5[0].items)[0],6);
   });
   it ('eatery mot found', async function () {
    const id=287;
    const eatery = await dao.newOrder(id);
    //console.log(eatery[0]._id);
    const eatery1= await dao.editOrder(eatery[0]._id,'some-item-id',5);
    const eatery2= await dao.editOrder(eatery[0]._id,'some-item-id',3);
    const eatery3= await dao.editOrder(eatery[0]._id,'some-more-item-id',2);
    const eatery4= await dao.editOrder(eatery[0]._id,'some-more-item-id',-2);
    const eatery5= await dao.editOrder(eatery[0]._id,'some-item-id',-2);
    //console.log();
    assert.equal((eatery4[0].items)[1], undefined);
    assert.equal(Object.values(eatery5[0].items)[0],6);
    const removeorder=await dao.removeOrder(eatery[0]._id);
    const getorder=await dao.getOrder(eatery[0]._id);
   // console.log(getorder);
    assert.equal(getorder._errors?.[0]?.code, undefined);
   });
});	


	

function readJson(path) {
  const text = fs.readFileSync(path, 'utf8');
  return JSON.parse(text);
}
