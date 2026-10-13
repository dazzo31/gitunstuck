export const viewNames = ['home', 'learn', 'fix', 'reference'];
export function parseRoute(hash) {
 let decoded;try {decoded=decodeURIComponent(hash.replace(/^#/,''));}catch{return {view:'home',item:null,legacy:null,malformed:true};}
 const [view,item]=decoded.split('/');
 if(!view)return {view:'home',item:null,legacy:null,malformed:false};
 if(view==='workflows')return {view:'learn',item:item||null,legacy:null,malformed:false};
 if(view==='playground')return {view:'learn',item:'visuals',legacy:null,malformed:false};
 if(viewNames.includes(view))return {view,item:item||null,legacy:null,malformed:false};
 return {view:null,item:null,legacy:decoded,malformed:false};
}
