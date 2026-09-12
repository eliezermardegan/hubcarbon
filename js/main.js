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
