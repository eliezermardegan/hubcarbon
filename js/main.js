const menuButton=document.querySelector('.menu-toggle');
const nav=document.querySelector('#site-nav');
if(menuButton && nav){
  menuButton.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded',String(open));
    const ml={en:{o:'Close',c:'Menu'},pt:{o:'Fechar',c:'Menu'},es:{o:'Cerrar',c:'Menú'},fr:{o:'Fermer',c:'Menu'}};const l=(document.documentElement.lang||'en').slice(0,2);menuButton.textContent=open?(ml[l]?.o||'Close'):(ml[l]?.c||'Menu');
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


/* V10.1 language selector normalization */
(function(){
  const box=document.querySelector('.language-switcher');
  if(!box) return;
  const path=window.location.pathname;
  const lang=path.startsWith('/pt/')?'pt':path.startsWith('/es/')?'es':path.startsWith('/fr/')?'fr':'en';
  const labels={en:'LANGUAGE',pt:'IDIOMA',es:'IDIOMA',fr:'LANGUE'};
  const base=path.includes('/pages/')?'pages/':'';
  const urls={
    en:base?'../pages/'+path.split('/pages/')[1]:'/',
    pt:base?'/pt/pages/'+path.split('/pages/')[1]:'/pt/',
    es:base?'/es/pages/'+path.split('/pages/')[1]:'/es/',
    fr:base?'/fr/pages/'+path.split('/pages/')[1]:'/fr/'
  };
  box.innerHTML='<span class="language-label">'+labels[lang]+'</span>'+['en','pt','es','fr'].map(function(x){return x===lang?'<span class="language-current" aria-current="page">'+x.toUpperCase()+'</span>':'<a href="'+urls[x]+'" hreflang="'+x+'">'+x.toUpperCase()+'</a>';}).join('');
})();


/* Multilingual footer and cookie text safeguard */
(function(){
  const lang=(document.documentElement.lang||'en').slice(0,2);
  const t={
    pt:{legal:'A Hub Carbon Limited é uma empresa registada em Inglaterra e no País de Gales com o número de registo 15657271',office:'e tem a sua sede registada em 71–75 Sheldon Street, London WC2H 9JQ, Reino Unido.',rights:'© 2026 Hub Carbon. Todos os direitos reservados.',privacy:'Privacidade e cookies',settings:'Configurações de cookies'},
    es:{legal:'Hub Carbon Limited es una empresa registrada en Inglaterra y Gales con el número de registro 15657271',office:'y su domicilio social está en 71–75 Sheldon Street, London WC2H 9JQ, Reino Unido.',rights:'© 2026 Hub Carbon. Todos los derechos reservados.',privacy:'Privacidad y cookies',settings:'Configuración de cookies'},
    fr:{legal:'Hub Carbon Limited est une société enregistrée en Angleterre et au Pays de Galles sous le numéro 15657271',office:'et son siège social est situé au 71–75 Sheldon Street, London WC2H 9JQ, Royaume-Uni.',rights:'© 2026 Hub Carbon. Tous droits réservés.',privacy:'Confidentialité et cookies',settings:'Paramètres des cookies'}
  }[lang];
  if(!t)return;
  const replace=(root,from,to)=>{if(!root)return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);nodes.forEach(n=>{if(n.nodeValue.includes(from))n.nodeValue=n.nodeValue.split(from).join(to);});};
  document.addEventListener('DOMContentLoaded',()=>{
    replace(document.body,'Hub Carbon Limited is a company registered in England and Wales with registered number 15657271',t.legal);
    replace(document.body,'and its registered office at 71–75 Sheldon Street, London WC2H 9JQ, United Kingdom.',t.office);
    replace(document.body,'© 2026 Hub Carbon. All rights reserved.',t.rights);
    replace(document.body,'Privacy & cookies',t.privacy);
    replace(document.body,'Privacy &amp; cookies',t.privacy);
    replace(document.body,'Read our Privacy & Cookies notice',lang==='pt'?'Leia o nosso aviso de Privacidade e Cookies':lang==='es'?'Lea nuestro aviso de Privacidad y Cookies':'Lire notre avis Confidentialité et Cookies');
    replace(document.body,'Read our Privacy &amp; Cookies notice',lang==='pt'?'Leia o nosso aviso de Privacidade e Cookies':lang==='es'?'Lea nuestro aviso de Privacidad y Cookies':'Lire notre avis Confidentialité et Cookies');
    replace(document.body,'Choose how Hub Carbon may use storage and access technologies. Your choice is remembered on this device and can be changed at any time.',lang==='pt'?'Escolha como a Hub Carbon pode utilizar tecnologias de armazenamento e acesso. A sua escolha fica guardada neste dispositivo e pode ser alterada a qualquer momento.':lang==='es'?'Elija cómo puede utilizar Hub Carbon las tecnologías de almacenamiento y acceso. Su elección se recuerda en este dispositivo y puede cambiarse en cualquier momento.':'Choisissez comment Hub Carbon peut utiliser les technologies de stockage et d’accès. Votre choix est mémorisé sur cet appareil et peut être modifié à tout moment.');
    replace(document.body,'Required for core website functions and to remember your privacy preference. These technologies do not require consent where they are strictly necessary.',lang==='pt'?'Necessário para as funções essenciais do site e para guardar a sua preferência de privacidade. Estas tecnologias não requerem consentimento quando são estritamente necessárias.':lang==='es'?'Necesario para las funciones esenciales del sitio y para recordar su preferencia de privacidad. Estas tecnologías no requieren consentimiento cuando son estrictamente necesarias.':'Nécessaire au fonctionnement essentiel du site et à la mémorisation de votre préférence de confidentialité. Ces technologies ne nécessitent pas de consentement lorsqu’elles sont strictement nécessaires.');
    replace(document.body,'Helps us understand how visitors use the website so we can improve content and performance. No analytics technology is currently active on this site.',lang==='pt'?'Ajuda-nos a compreender como os visitantes utilizam o site para melhorar o conteúdo e o desempenho. Não existe atualmente tecnologia de análise ativa neste site.':lang==='es'?'Nos ayuda a comprender cómo utilizan los visitantes el sitio para mejorar el contenido y el rendimiento. Actualmente no hay ninguna tecnología de análisis activa en este sitio.':'Nous aide à comprendre comment les visiteurs utilisent le site afin d’améliorer le contenu et les performances. Aucune technologie d’analyse n’est actuellement active sur ce site.');
    replace(document.body,'Always active',lang==='pt'?'Sempre ativo':lang==='es'?'Siempre activo':'Toujours actif');
    replace(document.body,'Not currently active',lang==='pt'?'Não ativo atualmente':lang==='es'?'Actualmente inactivo':'Actuellement inactif');
    replace(document.body,'Save essential only',lang==='pt'?'Guardar apenas o essencial':lang==='es'?'Guardar solo lo esencial':'Enregistrer uniquement l’essentiel');
    replace(document.body,'Close cookie settings',lang==='pt'?'Fechar configurações de cookies':lang==='es'?'Cerrar configuración de cookies':'Fermer les paramètres des cookies');
  });
})();


/* Footer language policy: legal footer stays in English */
(function(){
  const applyEnglishFooter=()=>document.querySelectorAll('.footer-legal').forEach(el=>{
    const cols=el.querySelectorAll(':scope > div');
    if(cols[0]) cols[0].innerHTML='Hub Carbon Limited is a company registered in England and Wales with registered number 15657271<br>and its registered office at 71–75 Sheldon Street, London WC2H 9JQ, United Kingdom.';
    if(cols[1]) cols[1].textContent='© 2026 Hub Carbon. All rights reserved.';
  });
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',applyEnglishFooter); else applyEnglishFooter();
})();
