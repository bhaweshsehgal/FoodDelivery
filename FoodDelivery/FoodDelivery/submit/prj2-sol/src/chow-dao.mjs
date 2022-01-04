import { AppError,} from './util.mjs';
import params from './params.mjs';

import mongo from 'mongodb';

//use in mongo.connect() to avoid warning
const MONGO_CONNECT_OPTIONS = { useUnifiedTopology: true };

const EATERIES_COLLECTION = 'eateries';
//TODO
const ORDERS_COLLECTION = 'orders';

// properties which are used only within mongo documents and should be
// removed from returned objects.
const INTERNALS = [ '_id', '_cuisine', '_location' ];

/** Exported factory method. */
export default async function make(dbUrl) {
  return await ChowDao.make(dbUrl);
}

/**
 * In addition to the docs for each method, each method is subject to
 * the following additional requirements:
 *
 *   + All string matching is case-insensitive.  Hence specifying
 *     cuisine "american" or "American" for locate() should return
 *     a list of all eateries having American cuisine.
 *
 *   + The implementation of each of the required methods should not
 *     require searching.  Instead, the database should set up
 *     suitable data structure which allow returning the requested
 *     information without searching.
 *  
 *   + Errors are returned by returning an object with property
 *     _errors which must be a list of objects, each having 
 *     message and code properties.
 *
 *   + Any otherwise uncategorized database error should be returned
 *     with code 'DB'.
 */
class ChowDao {

  //nextorderIdStart=0;
  constructor(params) {  Object.assign(this, params); }
  
  //factory method which performs connection set up async calls
  //and all other necessary initialization, sets up properties
  //to be stored in the ChowDao instance and finally returns
  //the instance created using the properties.
  //Returns object containsing an errors property if a db errors.
  static async make(dbUrl) {
    const params = {};
    try {
      params._client = await mongo.connect(dbUrl, MONGO_CONNECT_OPTIONS);
      const db = params._client.db();
      params._eateries = db.collection(EATERIES_COLLECTION);
     //console.log("sd");
      params._orders = db.collection(ORDERS_COLLECTION);  
      
    }
    catch (err) {
      const msg = `cannot connect to URL "${dbUrl}": ${err}`;
      return { errors: [ new AppError(msg, { code: 'DB'}) ] };
    }
    return new ChowDao(params);
  }

  /** Release all resources held by this instance.
   *  Specifically, close any database connections.
   */
  async close() {
    await this._client.close();
  }

  /** Return a new order object { id, eateryId } having an id
   *  field set to an ID different from that of any existing order.
   *  The order-id should be hard to guess.
   *  Returns an object with errors property if db errors encountered.
   */ 
  async newOrder(eateryId) {
    try {
    	//let 
	let uniqueId=await this._nextOrderId();
	const neworder={_id:uniqueId,"eateryID":eateryId};
        const ret=await  this._eateries.insertOne(neworder);
        return ret.ops;
    }
    catch (err) {
      const msg = `cannot create new order: ${err}`;
      return { errors: [ new AppError(msg, { code: 'DB'}) ] };
    }
  }

  // Returns a unique, difficult to guess order-id.
  async _nextOrderId() {
    //TODO
   
    const myret=await this._eateries.findOne({ _id:'nextId'});
    if(myret===null){
    const newId={_id:'nextId','mynextOrderId':0};
    const idfornextorder=await this._eateries.insertOne(newId);
    let myvar=new IdGen(0);
    const uniqueId=myvar.nextId();
    return uniqueId;
    }
    else{
    const m=myret.mynextOrderId;
    const k=parseInt(m)+1;
    var set1={};
    set1["mynextOrderId"]=k;
    const idfornext=await this._eateries.updateOne({_id:'nextId'},{$set:set1});
    try{
    let myvar=new IdGen(k);
    const uniqueId=myvar.nextId();
    return uniqueId;
    }
    catch(err){
    const msg = `cannot genrate new order ID: ${err}`;
    return { errors: [ new AppError(msg) ] };
    }
    
    }
   // return uniqueID;
    
  }

  /** Return object { id, eateryId, items? } containing details for
   *  order identified by orderId.  The returned items should be an object
   *  mapping an item-id to the positive quantity for that item.  
   *
   *  If there is no order having orderId, then return a NOT_FOUND error.
   */
  async getOrder(orderId) {
    try {
      //TODO
    //  console.log(orderId);
      const eatery = await
      this._eateries.find({ _id: orderId}).toArray();
   //   console.log(eatery[0]);
      if(eatery.length!==0){
      return eatery;
      }
      else{
        const msg = `No order with orderId ${orderId}`;
       return { errors: [ new AppError(msg, { code: 'NOT_FOUND'}) ] };
      }
    }
    catch (err) {
      const msg = `cannot read order ${orderId}: ${err}`;
      return { errors: [ new AppError(msg, { code: 'DB'}) ] };
    }
  }

  /** Remove order identified by orderId from db.  Returns {} if ok,
   *  NOT_FOUND error if there is no order having id orderId.
   */
  async removeOrder(orderId) {
    try {
      //TODO
      const ret = await this._eateries.deleteOne({_id: orderId});
    //  console.log(ret.deletedCount);
      if (ret.deletedCount === 0) {
     //  console.log("dsdsds");
       const msg = `No order with orderId ${orderId}`;
       return { errors: [ new AppError(msg, { code: 'NOT_FOUND'}) ] };
      }
     
    return{};
    }
    catch (err) {
 //   console.log("dsdsds34");
      const msg = `cannot read order ${orderId}: ${err}`;
      return { errors: [ new AppError(msg, { code: 'DB'}) ] };
    }
  }

  /** Change quantity for itemId in order orderId by nChanges.  If
   *  itemId does not occur in the order, then set the quantity for
   *  itemId to nChanges.  If the item specified by itemId occurs in
   *  the order and nChanges >= 0, then increment the quantity by
   *  nChanges; if nChanges < 0, then decrement the quantity by
   *  |nChanges|.  Return updated order.  
   *
   *  Return error NOT_FOUND if there is no order for orderId, BAD_REQ
   *  if nChanges would result in a negative quantity for itemId.
   */
  async editOrder(orderId, itemId, nChanges) {
    try {
      //TODO
      var set1={};
      let ret=await this._eateries.find({ _id: orderId}).toArray();
      //console.log(ret[0].items[itemId]);
      if(ret.length===0){
       const msg = `No order with orderId ${orderId}`;
       return { errors: [ new AppError(msg, { code: 'NOT_FOUND'}) ] };
      }
      if(ret[0].items===undefined){
      if(nChanges>0){
     
      set1[itemId]=nChanges;
      const set = {"items":set1};
      //console.log(set);
      const ret =
      await this._eateries.updateOne({ _id: orderId }, { $set: set });
      return this.getOrder(orderId);
      }
      else{
      const msg = `cannot remove ${nChanges} items with only 0 items available `;
      return { errors: [ new AppError(msg, { code: 'BAD_REQ'}) ] };
          }
      }
      else{
       let bool=true;
      for(let i=0;i<Object.keys(ret[0].items).length;i++){
      if(Object.keys(ret[0].items)[i]===itemId&&(Object.values(ret[0].items)[i]+nChanges>0||nChanges>0)){
      let k=Object.values(ret[0].items)[i]+nChanges;
      set1[itemId]=k;
      bool=false;
      }
      else if(Object.keys(ret[0].items)[i]===itemId&&(Object.values(ret[0].items)[i]+nChanges===0)){
      bool=false;
      }
      else if(Object.keys(ret[0].items)[i]===itemId && Object.values(ret[0].items)[i]+nChanges<0){
      const msg = `cannot remove ${-nChanges} items with only ${Object.values(ret[0].items)[i]} items available  `;
      return { errors: [ new AppError(msg, { code: 'DB'}) ] };
      }
      else{
      set1[Object.keys(ret[0].items)[i]]=Object.values(ret[0].items)[i];
      }
      }
      if(bool&&nChanges>0){
      set1[itemId]=nChanges;
      }
      else if(bool){
      const msg = `cannot remove ${nChanges} items with only 0 items available`;
      return { errors: [ new AppError(msg, { code: 'BAD_REQ'}) ] };
      }
      const set={"items":set1};
      const myret= await this._eateries.updateOne({ _id: orderId },{$set:set});
      }
      return await this.getOrder(orderId);
    }
    catch (err) {
      const msg = `cannot read order ${orderId}: ${err}`;
      return { errors: [ new AppError(msg, { code: 'DB'}) ] };
    }
  }

  /** Return eatery having specified id eid.  Return errors if eid is
   *  invalid with error object having code property 'NOT_FOUND'.
   */
  async getEatery(eid) {
    try {
      const eatery = await
        this._eateries.findOne({ _id: eid.replaceAll('.', '_') });
      if (eatery === null) {
	const msg = `cannot find eatery "${eid}"`;
	return { errors: [ new AppError(msg, { code: 'NOT_FOUND'}) ] };
      }
      const ret = { ...eatery };
      INTERNALS.forEach(i => delete ret[i]);
      return ret;
    }
    catch (err) {
      const msg = `cannot find eatery "${eid}": ${err}`;
      return { errors: [ new AppError(msg, { code: 'DB'}) ] };
    }
  }

  /** Replace all existing eateries in underlying database with eateries. */
  async loadEateries(eateries) {
    try {
      await this._eateries.deleteMany({});
      await this._eateries.createIndex({_cuisine: 'hashed'});
      await this._eateries.createIndex({_location: '2dsphere'});
      for (const eatery of eateries) {
	const insert = {
	  ...eatery,
	  _id: eatery.id.replaceAll('.', '_'),
	  _cuisine: eatery.cuisine.toLowerCase(),
	  _location: {
	    type: 'Point',
	    coordinates: [ eatery.loc.lng, eatery.loc.lat ],
	  },
	};
	const ret = await this._eateries.insertOne(insert);
	if (ret.insertedCount !== 1) {
	  throw `inserted ${ret.insertedCount} eateries for ${eatery.id}`;
	}
      }
    }
    catch (err) {
      const msg = `cannot load eateries: ${err}`;
      return { errors: [ new AppError(msg, { code: 'DB'}) ] };
    }
  }

  /** return list giving info for eateries having the
   *  specified cuisine.
   *  The info returned for each eatery must contain the
   *  following fields: 
   *     id: the eatery ID.
   *     name: the eatery name.
   *     loc: { lat, lng } object giving location of eatery,
   *     dist: the distance of the eatery from loc
   *  The returned list must be sorted by dist from 
   *  loc { lat, lng }.  Return [] if there are no eateries for the 
   *  specified cuisine.
   */
  async locateEateries(cuisine, loc=params.bingLoc, index=0,
		       count=params.defaultCount)
  {
    try {
      const params = [{
	$geoNear: {
	  near: { type: 'Point', coordinates: [ loc.lng, loc.lat ] },
	  spherical: true,
	  query: { _cuisine: cuisine.toLowerCase(), },
	  distanceField: 'dist',
	  distanceMultiplier: 1/1600,
	},
      }];
      
      const cursor = await
        this._eateries.aggregate(params).skip(index).limit(count);
      const arr = await cursor.toArray();
      //console.log(arr);
      return arr.map(a => ({
	id: a.id,
	name: a.name,
	loc: a.loc,
	dist: a.dist,
	cusine: a.cuisine,
      }));
    }
    catch (err) {
      const msg = `
	cannot locate "${cuisine} eateries at (${loc.lat}, ${loc.lng}): ${err}
      `.trim();
      return { errors: [ new AppError(msg, { code: 'DB'}) ] };
    }
  }

}

/** Generate id strings.  Construct by passing an integer base which
 *  will be used to generate the base part of an id as "baseInc_rand"
 *  where baseInc is an increment of base and rand is a random number.
 *  baseInc will  the id unique and rand will make the id
 *  difficult to guess.
 *
 *  Exposes a base property giving the current value of base.
 */
const ID_RAND_LEN = 2;  //increase for production code
class IdGen {
  constructor(base) { this._base = base; }

  nextId() {
    return (this._base++ + Math.random())
      .toFixed(ID_RAND_LEN)
      .replace('.', '_');
  }

  get base() { return this._base; }
  
}

