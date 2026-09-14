const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('#site-nav');
if(menuButton && nav){
  menuButton.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.textContent=open?'Close':'Menu';
  });
}

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{ if(entry.isIntersecting) entry.target.classList.add('visible'); });
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',()=>{
    if(nav){nav.classList.remove('open');if(menuButton){menuButton.textContent='Menu';menuButton.setAttribute('aria-expanded','false');}}
  });
});

/* Hub Carbon privacy-first cookie notice.
   The current site uses only essential storage for remembering this choice.
   No analytics or advertising scripts are loaded by this implementation. */
(function(){
  const CONSENT_KEY='hubcarbon_cookie_consent';
  const getConsent=()=>{
    try{
      const raw=localStorage.getItem(CONSENT_KEY);
      return raw?JSON.parse(raw):null;
    }catch(e){return null;}
  };
  const saveConsent=(value)=>{
    try{localStorage.setItem(CONSENT_KEY,JSON.stringify({essential:true,analytics:false,updatedAt:new Date().toISOString(),choice:value}));}catch(e){}
  };
  const openSettings=()=>{
    const modal=document.querySelector('#cookie-settings');
    if(modal){modal.hidden=false;document.body.classList.add('cookie-modal-open');modal.querySelector('.cookie-close')?.focus();}
  };
  const closeSettings=()=>{
    const modal=document.querySelector('#cookie-settings');
    if(modal){modal.hidden=true;document.body.classList.remove('cookie-modal-open');}
  };
  const hideBanner=()=>{
    const banner=document.querySelector('#cookie-banner');
    if(banner) banner.hidden=true;
  };
  const acceptEssential=()=>{saveConsent('essential-only');hideBanner();closeSettings();};
  const init=()=>{
    const banner=document.querySelector('#cookie-banner');
    const settings=document.querySelector('#cookie-settings');
    const saved=getConsent();
    if(!saved && banner) banner.hidden=false;
    document.querySelectorAll('[data-cookie-settings]').forEach(btn=>btn.addEventListener('click',openSettings));
    document.querySelectorAll('[data-cookie-essential]').forEach(btn=>btn.addEventListener('click',acceptEssential));
    settings?.querySelector('.cookie-close')?.addEventListener('click',closeSettings);
    settings?.addEventListener('click',e=>{if(e.target===settings) closeSettings();});
    document.addEventListener('keydown',e=>{if(e.key==='Escape' && settings && !settings.hidden) closeSettings();});
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
