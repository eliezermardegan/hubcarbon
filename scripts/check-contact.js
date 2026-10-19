/* Contract checks for enquiry handling. Uses no network and submits no messages. */
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
const contact = source.slice(source.indexOf('/* Existing Formspree endpoint;'), source.indexOf('/* Hub Carbon privacy-first'));

function setup({query = '', language = 'en', response = {ok:true, json:async()=>({ok:true})}, reject = false, deferred = false} = {}) {
  const listeners = {};
  const topic = {value:''};
  const button = {textContent:'Send enquiry', disabled:false};
  const status = {textContent:'', className:'', focus(){}};
  const fields = {message:'Keep this message', name:'Example'};
  let reset = false, calls = 0, resolve;
  const pending = new Promise(r => { resolve = r; });
  const form = {
    action:'https://formspree.io/f/xppzgddy', elements:{namedItem:()=>topic},
    addEventListener:(name,fn)=>{listeners[name]=fn;},
    querySelector:s=>s === '[type="submit"]' ? button : status,
    reportValidity:()=>true,setAttribute(){},removeAttribute(){},
    reset(){reset=true;fields.message='';topic.value='';}
  };
  const fetch = async (url, options) => {
    calls++;assert.equal(url,form.action);assert.equal(options.method,'POST');
    if (deferred) await pending;
    if (reject) throw new Error('Network unavailable');
    return response;
  };
  const FormData = function(){};
  vm.runInNewContext(contact,{
    document:{documentElement:{lang:language},querySelector:()=>form},
    window:{location:{search:query},fetch,FormData,AbortController},
    URLSearchParams,fetch,FormData,AbortController,setTimeout,clearTimeout,
    hubCarbonMetric(){}
  });
  return {topic,button,status,fields,submit:()=>listeners.submit({preventDefault(){}}),release:resolve,calls:()=>calls,reset:()=>reset};
}
(async()=>{
  for (const topic of ['intelligence','decarbonisation','projects','markets','finance','partnership','other']) {
    assert.equal(setup({query:'?topic='+topic}).topic.value,topic);
  }
  assert.equal(setup({query:'?topic=platform'}).topic.value,'');
  assert.equal(setup({query:'?topic=untrusted'}).topic.value,'');
  const successful=setup();await successful.submit();
  assert.equal(successful.reset(),true);assert.match(successful.status.textContent,/has been sent/);
  for (const language of ['en','pt','es','fr']) {
    const failed=setup({language,reject:true});await failed.submit();
    assert.equal(failed.reset(),false);assert.equal(failed.fields.message,'Keep this message');
    assert.equal(failed.button.disabled,false);assert.match(failed.status.textContent,/info@hubcarbon.com/);
  }
  const rejected=setup({response:{ok:false,json:async()=>({errors:[{message:'Rejected'}]})}});await rejected.submit();
  assert.equal(rejected.reset(),false);
  const slow=setup({deferred:true});const first=slow.submit();await slow.submit();
  assert.equal(slow.calls(),1);assert.equal(slow.button.disabled,true);slow.release();await first;
  assert.equal(slow.button.disabled,false);
  console.log('PASS: enquiry topics, translated failures, preserved fields, success and duplicate-submit protection. No messages sent.');
})().catch(error=>{console.error(error);process.exitCode=1;});
