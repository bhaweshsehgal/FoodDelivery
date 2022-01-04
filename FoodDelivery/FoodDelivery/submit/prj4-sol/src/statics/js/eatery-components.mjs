import { newElement, geoLoc } from './util.mjs';

/*
  A component which searches for eateries by location and cuisine.
  The location must be set to the browser's location (from geoLoc()).

  This component has two attributes:

    ws-url:  the base URL (protocol, host, port) where the web
             services are located.
    cuisine: the cuisine to be searched for.

  This component does not do anything when first connected to the DOM.
  It must respond to changes in its attribute values:

    ws-url: when this attribute changes, the component simply remembers
    its value.

    cuisine: when changed, the component should make a web-service call
    to search for eateries for that cuisine with location set to the 
    browser's location.  Then it should set it's content corresponding
    to the pseudo-HTML shown below (dynamic data is shown within ${...} and
    wsData is the data returned from the web-service call):

      <ul class="eatery-results">
	<!-- repeat for each eatery in wsData.eateries -->
	<li>
	  <span class="eatery-name">${eatery.name}</span>
	  <span>${eatery.dist} miles</span>
	  <a href=${links:self.href}>
	    <button>Select</button>
	  </a>
	</li>
      </ul>

    The handler for the Select button should be set up to set
    the eatery-url attribute for the eatery-details component.

    This should be followed by up-to two scrolling links:

      <div class="scroll">
	<!-- only when ${wsData.links:prev} -->
	<a rel="prev" href="${wsData.links:prev.href}">
	  <button>&lt;</button>
	</a>
	<!-- only when ${wsData.links:next} -->
	<a rel="next" href="${wsData.links:next.href}">
	  <button>&gt;</button>
	</a>
      </div>

    When the above scrolling links are clicked, the results should
    be scrolled back-and-forth.

*/
let count=0;
class EateryResults extends HTMLElement {
 
  static get observedAttributes() { return [ 'ws-url', 'cuisine', ]; }

  
  async attributeChangedCallback(name, oldValue, newValue) {
    //TODO
    count++;
    const wsUrl='https://zdu.binghamton.edu:2345';
    let data="";
    let loc=await geoLoc();
    let lat=loc.lat;
    let lng=loc.lng;
    let cuisine=newValue;
    let url=`${wsUrl}/eateries/${lat},${lng}?cuisine=${cuisine}`; 
    //this.innerHTML="";
    const url1 = new URL(url);
    if(!newValue.includes('http')){
     data=await fetchText(url); 
    }
    else{
     data=await fetchText(newValue);
    }
    let elem=document.querySelectorAll('.scroll');
    if(elem.length>0)
    elem[0].parentNode.removeChild(elem[0]);
    let elem1=document.querySelectorAll('.eatery-results');
     if(elem1.length>0){
     for(let i=0;i<elem1.length;i++){
     elem1[i].parentNode.removeChild(elem1[i])
     }
     }
     for(let i=0;i<data.eateries.length;i++){
	const name1=data.eateries[i].name;
	const link="https://zdu.binghamton.edu:2345";
	let dist1=data.eateries[i].dist;
	dist1=(Math.round(dist1 * 100) / 100).toFixed(2);
	dist1+=" miles";
	const hdr = newElement('ul',{class:'eatery-results'},newElement('li',{class:''},newElement('span', { class: 'eatery-name' }, name1)
	,newElement('span', { class: '' }, dist1),newElement('button', { class: 'mybutton',href:`${wsUrl}/eateries/`+data.eateries[i].id },'select')));
	//hdr.querySelector('button').addEventListener('click', () => this.displayItems(`${wsUrl}/eateries/`+data.eateries[i].id));
         hdr.querySelector('button').addEventListener('click',() => {this.displayItems(hdr.querySelector('button').getAttribute('href'))})
        this.append(hdr);
     }
    let hdr;
    if(data.links.length===3){
    hdr=newElement('div',{class:'scroll'},newElement('a',{class:'anchor',rel:'prev'},
    newElement('button',{class:'btnprev'},'<')),newElement('a',{class:'anchor',rel:'next'},
    newElement('button',{class:'btnnext'},'>')));
    hdr.querySelector('.btnprev').addEventListener('click', () => this.displayItems1(data.links[2].href));
    hdr.querySelector('.btnnext').addEventListener('click', () => this.displayItems1(data.links[1].href));
    }
    else if(data.links.length===2){
    if(data.links[1].name==='next'){
    hdr=newElement('div',{class:'scroll'},newElement('a',{class:'anchor',rel:'next'},newElement('button',{class:''},'>')));
    hdr.querySelector('button').addEventListener('click', () => this.displayItems1(data.links[1].href));
    }
    else{
    hdr=newElement('div',{class:'scroll'},newElement('a',{class:'anchor',rel:'prev'},newElement('button',{class:''},'<')));
    hdr.querySelector('button').addEventListener('click', () => this.displayItems1(data.links[1].href));
    }
    }
    this.append(hdr);
 }
  //TODO auxiliary methods
  displayItems(hdr){
   let elem3=document.querySelectorAll('.menu1-category');
   if(elem3.length>0)
   elem3[0].parentNode.removeChild(elem3[0]);
   let elem2=document.querySelectorAll('.category-items');
   if(elem2.length>0){
   for(let i=0;i<elem2.length;i++){
    elem2[i].parentNode.removeChild(elem2[i]);
   }
   }
  document.querySelector('eatery-details').setAttribute('eatery-url', hdr);
  }
  displayItems1(wsUrl){
  const eateryResults = document.querySelector('eatery-results');
  eateryResults.setAttribute('ws-url', wsUrl);
  }
}


//register custom-element as eatery-results
customElements.define('eatery-results', EateryResults);


/*
  A component which shows the details of an eatery.  

  When created, it is set up with a buyFn *property* which should be
  called with an eatery-id and item-id to order a single unit of the
  item item-id belonging to eatery-id.

  The component has a single attribute: eatery-url which is the url
  for the web service which provides details for a particular eatery.

  This component does not do anything when first connected to the DOM.
  It must respond to changes in its eatery-url attribute.  It must
  call the web service corresponding to the eatery-url and set it's
  content corresponding to the pseudo-HTML shown below (dynamic data
  is shown within ${...} and wsData is the data returned from the
  web-service call):


      <h2 class="eatery-name">${wsData.name} Menu</h2>
      <ul class="eatery-categories">
	<!-- repeat for each category in wsData.menuCategories -->
	<button class="menu-category">${category}</button>
      </ul>
      <!-- will be populated with items for category when clicked above -->
      <div id="category-details"></div>

  The handler for the menu-category button should populate the
  category-details div for the button's category as follows:

      <h2>${category}</h2>
      <ul class="category-items">
	<!-- repeat for each item in wsData.flatMenu[wsData.menu[category]] -->
	<li>
	  <span class="item-name">${item.name}</span>
	  <span class="item-price">${item.price}</span>
	  <span class="item-details">${item.details}</span>
	  <button class="item-buy">Buy</button>
	</li>
      </ul>

  The handler for the Buy button should be set up to call
  buyFn(eatery.id, item.id).

*/
class EateryDetails extends HTMLElement {

  static get observedAttributes() { return [ 'eatery-url', ]; }
  
  async attributeChangedCallback(name, oldValue, newValue) {
    //TODO
    const wsData=await fetchText(newValue);
    let elem1=document.querySelectorAll('.eatery-name');
   if(elem1.length>5)
    elem1[5].parentNode.removeChild(elem1[5]);
    let elem=document.querySelectorAll('.menu-category');
    if(elem.length>0){
    for(let i=0;i<elem.length;i++){
    elem[i].parentNode.removeChild(elem[i]);
    }
    }
    const name1 = `${wsData.name} Menu`;
    const hdr = newElement('h2', { class: 'eatery-name' }, name1);
    this.append(hdr);
    for(let i=0;i<wsData.menuCategories.length;i++){
    const name1=wsData.menuCategories[i];
    const hdr = newElement('button', { class: 'menu-category' }, name1);
    this.append(hdr);
    hdr.addEventListener('click', () => this.displayMenu(hdr.innerText,wsData));
    } 
    }
   displayMenu(str,wsData){
   let elem1=document.querySelectorAll('.menu1-category');
   if(elem1.length>0)
   elem1[0].parentNode.removeChild(elem1[0]);
   let elem=document.querySelectorAll('.category-items');
   if(elem.length>0){
   for(let i=0;i<elem.length;i++){
    elem[i].parentNode.removeChild(elem[i]);
   }
   }
    const hdr3=newElement('h2',{class:'menu1-category'},str);
    this.append(hdr3);
    for(let i=0;i<wsData.menu[`${str}`].length;i++){
    const name1=wsData.flatMenu[wsData.menu[`${str}`][i]].name;
    const price=wsData.flatMenu[wsData.menu[`${str}`][i]].price;
    const details=wsData.flatMenu[wsData.menu[`${str}`][i]].details;
    const hdr = newElement('ul',{class:'category-items'},newElement('li',{class:''},newElement('span', { class: 'item-name' }, name1)
    ,newElement('span',{class:"item-price"},price),newElement('span',{class:"item-details"},details),newElement('button', { class: 'item-buy' },'Buy')));
    this.append(hdr);
   // console.log();
     hdr.querySelector('.item-buy').addEventListener('click', () => this.buyFn(wsData.id,wsData.flatMenu[wsData.menu[`${str}`][i]].id));
    }
    }
   }
  
  

  //TODO auxiliary methods
  



async function fetchText(myurl) {
    let response = await fetch(myurl);
    if (response.status === 200) {
        let data = await response.json();
        // handle data
        return data;
    }
}

//register custom-element as eatery-details
customElements.define('eatery-details', EateryDetails);

/** Given a list of links and a rel value, return the href for the
 *  link in links having the specified value.
 */
function getHref(links, rel) {
		//console.log("getHref");
  return links.find(link => link.rel === rel)?.href;
}

//TODO auxiliary functions
