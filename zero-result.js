/* Normalize an upstream "not found" response into a successful empty result. */
(function(){
  const nativeFetch=window.fetch.bind(window);
  window.fetch=async function(input,init){
    const response=await nativeFetch(input,init);
    const url=typeof input==='string'?input:(input&&input.url)||'';
    if(/\/api\/check\.php(?:\?|$)/.test(url)&&response.status===404){
      return new Response(JSON.stringify({status:'success',data:{List:{}}}),{status:200,headers:{'Content-Type':'application/json'}});
    }
    return response;
  };
})();
