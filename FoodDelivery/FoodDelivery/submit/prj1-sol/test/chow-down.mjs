import fs from 'fs';

import makeChowDown from '../src/chow-down.mjs';

import chai from 'chai';
const { assert } = chai;

const COURSE_DIR = `${process.env.HOME}/cs544`;
const DATA_PATH = `${COURSE_DIR}/data/chow-down.json`;
const DATA = readJson(DATA_PATH);

describe('chowDown', function() {

  let chowDown;

  beforeEach(() => chowDown = makeChowDown(DATA));

  it ('must find Chinese cuisine', function () {
    const results = chowDown.locate('Chinese');
    assert.equal(results.length, 19);
  });

  it ('must find cuisine sorted by dist', function () {
    const results = chowDown.locate('indian');
    assert(results.length > 0);
    assert(results.every((r, i, res) => i === 0 || r.dist >= res[i - 1].dist));
  });

  it ('must find cuisine irrespective of case', function () {
    const results = chowDown.locate('aMeRIcaN');
    assert(results.length > 0);
  });

  it ('must find cuisine irrespective of case', function () {
    const results = chowDown.locate('MexIcaN');
    assert(results.length > 0);
  });
  it ('must return empty list for non-existent cuisine', function () {
    const results = chowDown.locate('italian');
    assert(results.length === 0);
  });

  it ('must find eatery categories', function () {
    const results = chowDown.categories('5.70');
    assert.equal(results.length, 17);
    assert(results.includes('Dessert'));
    assert(results.includes('Grill'));
  });
   it ('must find eatery categories', function () {
    const results = chowDown.categories('1.07');
    assert.equal(results.length, 22);
    assert(results.includes('Indo-Chinese Delicacies'));
    assert(results.includes('Biryani'));
  });
  
   it ('must find eatery categories', function () {
    const results = chowDown.categories('3.04');
    assert.equal(results.length, 19);
    assert(results.includes('Soups'));
    assert(results.includes('Fried Rice'));
  });
   it ('must find eatery categories', function () {
    const results = chowDown.categories('4.68');
    assert.equal(results.length, 22);
    assert(results.includes('Egg Specialties'));
    assert(results.includes('Seafood Entrees'));
  });

  it ('must return a NOT_FOUND error for a non-existent eatery', function () {
    const results = chowDown.categories('5.7');
    assert.equal(results._errors?.[0]?.code, 'NOT_FOUND');
  });
 it ('must find eatery', function () {
    const results = chowDown.menu('5.70', 'everything else');
    assert.equal(results.length, 2);
    assert(results.length > 0);;
    
    
   assert(Object.values(results[1]).includes('Soco'));
  })
  it ('must find eatery', function () {
    const results = chowDown.menu('1.07', 'Lamb Entrees');
     assert.equal(results.length, 25);
    assert(results.length > 0);
   // console.log(Object.values(results[1]).includes('Lamb Rogan Josh'));
    assert(Object.values(results[1]).includes('Lamb Rogan Josh'));
  });
 it ('must find eatery', function () {
    const results = chowDown.menu('6.88', 'Small Plates');
     assert.equal(results.length, 7);
    assert(results.length > 0);
   // console.log(Object.values(results));
    assert(Object.values(results[2]).includes('Short Rib Nachos'));
  });
  it ('must find eatery', function () {
    const results = chowDown.menu('7.20', 'soups');
     assert.equal(results.length, 10);
    assert(results.length > 0);
    console.log(Object.values(results[1]));
    assert(Object.values(results[1]).includes('Served with crispy noodles.'));
  });
});	

function readJson(path) {
  const text = fs.readFileSync(path, 'utf8');
  return JSON.parse(text);
}
