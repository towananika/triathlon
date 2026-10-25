// Legacy public API: never grants development access. Real access is checked by Sites.
window.TriAdmin={on:function(){return false;},ready:function(){return true;},mark:function(){return '';},login:function(){return Promise.resolve({ok:false});},logout:function(){try{localStorage.removeItem('tri-admin');}catch(e){}}};
