import { AppError } from './util.mjs';
/**
 * In addition to the docs for each method, each method is subject to
 * the following additional requirements:
 *
 *   + All string matching is case-insensitive.  Hence specifying
 *     cuisine "american" or "American" for locate() should return
 *     a list of all eateries having American cuisine.
 *
 *   + The implementation of each of the required methods should not
 *     require searching.  Instead, the returned object instance
 *     should set up suitable data structure which allow returning the
 *     requested information without searching.
 *  
 *   + Errors are returned by returning an object with property
 *     _errors which must be a list of objects, each having a 
 *     message property.
 */

class ChowDown {
    myhashtable=[[],[],[],[]];
    mycategories=[];
    mymenu=[''];
     /** Create a new ChowDown object for specified eateries */
    
  constructor(eateries) {
    //TODO
   
    let firstTimerunconstructor=true;
    let american=false,indian=false,mexican=false,chinese=false;
    
    let myeateries = [];
    eateries.sort(function(a, b) {
    return parseFloat(a.dist) - parseFloat(b.dist);
    });
    for(let i=0;i<eateries.length;i++){
    eateries[i].cuisine=eateries[i].cuisine.toLowerCase();
   // console.log(eateries[i].cuisine);
    }
    for( let i=0;i<eateries.length;i++){
    	if(eateries[i].cuisine==='american'){
    	   this.myhashtable[0].push({'id':eateries[i].id,'name':eateries[i].name,'dist':eateries[i].dist});
    	}
    	if(eateries[i].cuisine==='indian'){
    	   this.myhashtable[1].push({'id':eateries[i].id,'name':eateries[i].name,'dist':eateries[i].dist});
    	}
    	if(eateries[i].cuisine==='mexican'){
    	   this.myhashtable[2].push({'id':eateries[i].id,'name':eateries[i].name,'dist':eateries[i].dist});
    	}
    	if(eateries[i].cuisine==='chinese'){
    	    this.myhashtable[3].push({'id':eateries[i].id,'name':eateries[i].name,'dist':eateries[i].dist});
    	}
    }

   // console.log(this.myhashtable[0]);
     
    //implemetation of categories
	for(let i=0;i<eateries.length;i++){
	this.mycategories[eateries[i].id]=Object.keys(eateries[i].menu);
	//console.log(Object.keys(eateries[i].menu));
	}

   //implementation of menu
   	
   	for(let i=0;i<eateries.length;i++){
   	for(let j=0;j<Object.keys(eateries[i].menu).length;j++){
   		this.mymenu[eateries[i].id+Object.keys(eateries[i].menu)[j].toLowerCase()]=Object.values(eateries[i].menu)[j];
   		//console.log(eateries[i].id+Object.keys(eateries[i].menu)[j].toLowerCase(),Object.values(eateries[i].menu)[j]);
   	  }
   	}
   	console.log();
  }
  /** return list giving info for eateries having the
   *  specified cuisine.  The info for each eatery must contain the
   *  following fields: 
   *     id: the eatery ID.
   *     name: the eatery name.
   *     dist: the distance of the eatery.
   *  The returned list must be sorted by distance.  Return [] if
   *  there are no eateries for the specified cuisine
   */
  locate(cuisine) {
    //TODO
  	if(cuisine.toLowerCase()==='american'){
  	return this.myhashtable[0];
  	}
  	else if(cuisine.toLowerCase()==='indian'){
  	return this.myhashtable[1];
  	}
  	else if(cuisine.toLowerCase()==='mexican'){
  	return this.myhashtable[2];
  	}
  	else if(cuisine.toLowerCase()==='chinese'){
  	return this.myhashtable[3];
  	}
   	else{
   	// console.log(cuisine);
    	return [];
   	}
  }

  /** return list of menu categories for eatery having ID eid.  Return
   *  errors if eid is invalid with error object having code property
   *  'NOT_FOUND'.
   */
  categories(eid) {
    //TODO
    	
    	if(this.mycategories[eid]===undefined){
    	const msg = `bad eatery id ${eid}`;
    	return { _errors: [ new AppError(msg, { code: 'NOT_FOUND', }), ] };
    	}
    	else{
    	
    	return this.mycategories[eid];
    	}
   	
    //return [];
  }

  /** return list of menu-items for eatery eid in the specified
   *  category.  Return errors if eid or category are invalid
   *  with error object having code property 'NOT_FOUND'.
   */ 
  menu(eid, category) {
    //TODO
   if(this.mymenu[eid+(category.toLowerCase())]===undefined){
   const msg = `bad eatery id ${eid} ${category}`;
   return { _errors: [ new AppError(msg, { code: 'NOT_FOUND', }), ] };
   }
   else{
    return this.mymenu[eid+(category.toLowerCase())];
   }
  }
}
export default function make(eateries) {
  return new ChowDown(eateries);
}

