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


/* Global multilingual language selector */
(function(){
  const rootLang=(document.documentElement.lang||'en').slice(0,2);
  const path=window.location.pathname;
  const languages=[
    {code:'en',name:'English'},
    {code:'es',name:'Español'},
    {code:'fr',name:'Français'},
    {code:'pt',name:'Português'}
  ];
  const ui={
    en:{kicker:'LANGUAGE',title:'Select your language',search:'Type a language',note:'Hub Carbon is a global platform. Choose the language you prefer for this site.'},
    es:{kicker:'IDIOMA',title:'Selecciona tu idioma',search:'Buscar idioma',note:'Hub Carbon es una plataforma global. Elige el idioma que prefieras para este sitio.'},
    fr:{kicker:'LANGUE',title:'Choisissez votre langue',search:'Rechercher une langue',note:'Hub Carbon est une plateforme mondiale. Choisissez la langue que vous préférez pour ce site.'},
    pt:{kicker:'IDIOMA',title:'Selecione o seu idioma',search:'Pesquisar idioma',note:'A Hub Carbon é uma plataforma global. Escolha o idioma que prefere para este site.'}
  }[rootLang]||null;
  if(!ui)return;

  let box=document.querySelector('.language-switcher');
  if(!box){
    const nav=document.querySelector('.site-header .nav');
    const siteNav=document.querySelector('#site-nav');
    if(nav){box=document.createElement('div');box.className='language-switcher';box.setAttribute('aria-label',ui.title);if(siteNav)siteNav.insertAdjacentElement('afterend',box);else nav.appendChild(box);}
  }
  if(!box)return;
  box.setAttribute('role','button');
  box.setAttribute('tabindex','0');
  box.setAttribute('aria-haspopup','dialog');
  box.setAttribute('aria-expanded','false');
  box.innerHTML='<span class="language-label">'+ui.kicker+'</span><span class="language-current">'+rootLang.toUpperCase()+'</span>';

  let drawer=document.querySelector('#language-drawer');
  if(!drawer){
    drawer=document.createElement('div');
    drawer.id='language-drawer';
    drawer.className='language-drawer';
    drawer.hidden=true;
    drawer.innerHTML='<div class="language-drawer-panel" role="dialog" aria-modal="true" aria-labelledby="language-drawer-title"><div class="language-drawer-head"><div><div class="language-drawer-kicker">'+ui.kicker+'</div><h2 class="language-drawer-title" id="language-drawer-title">'+ui.title+'</h2></div><button type="button" class="language-drawer-close" aria-label="Close">×</button></div><div class="language-drawer-search"><input type="search" aria-label="'+ui.search+'" placeholder="'+ui.search+'"></div><div class="language-options"></div><p class="language-drawer-note">'+ui.note+'</p></div>';
    document.body.appendChild(drawer);
  }

  const options=drawer.querySelector('.language-options');
  const input=drawer.querySelector('input');
  const close=drawer.querySelector('.language-drawer-close');
  const urlFor=(code)=>{
    const normalized=path.replace(/\/+$/,'')||'/';
    const pageMatch=normalized.match(/\/(?:pt|es|fr)\/pages\/([^/]+)$/) || normalized.match(/\/pages\/([^/]+)$/);
    if(pageMatch)return code==='en'?'/pages/'+pageMatch[1]:'/'+code+'/pages/'+pageMatch[1];
    return code==='en'?'/':'/'+code+'/';
  };
  const render=(filter='')=>{
    const q=filter.trim().toLowerCase();
    options.innerHTML=languages.filter(l=>!q || l.name.toLowerCase().includes(q) || l.code.includes(q) || l.name.toLowerCase().includes(q)).map(l=>'<button type="button" class="language-option '+(l.code===rootLang?'is-current':'')+'" data-language="'+l.code+'"><span><strong>'+l.name+'</strong></span><span class="language-check" aria-hidden="true">✓</span></button>').join('');
    options.querySelectorAll('[data-language]').forEach(btn=>btn.addEventListener('click',()=>{const code=btn.dataset.language;if(code!==rootLang)window.location.href=urlFor(code);else closeDrawer();}));
  };
  const openDrawer=()=>{drawer.hidden=false;document.body.classList.add('language-drawer-open');box.setAttribute('aria-expanded','true');render();requestAnimationFrame(()=>input?.focus());};
  const closeDrawer=()=>{drawer.hidden=true;document.body.classList.remove('language-drawer-open');box.setAttribute('aria-expanded','false');};
  box.addEventListener('click',openDrawer);
  box.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openDrawer();}});
  close?.addEventListener('click',closeDrawer);
  drawer.addEventListener('click',e=>{if(e.target===drawer)closeDrawer();});
  input?.addEventListener('input',()=>render(input.value));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!drawer.hidden)closeDrawer();});
})();

/* Multilingual footer and cookie text safeguard */
(function(){
  const lang=(document.documentElement.lang||'en').slice(0,2);
  const t={
    pt:{legal:'A Hub Carbon Limited é uma empresa registada em Inglaterra e no País de Gales com o número de registo 15657271',office:'e tem a sua sede registada em 71–75 Sheldon Street, London WC2H 9JQ, Reino Unido.',rights:'© 2026 Hub Carbon. Todos os direitos reservados.',privacy:'Privacidade e cookies',settings:'Configurações de cookies',title:'Sua privacidade importa.',copy:'Hub Carbon utiliza atualmente apenas armazenamento essencial para manter o site a funcionar e recordar a sua escolha de privacidade. Atualmente não utilizamos cookies de análise ou publicidade.',link:'Leia o nosso aviso de Privacidade e Cookies',continue:'Continuar apenas com o essencial'},
    es:{legal:'Hub Carbon Limited es una empresa registrada en Inglaterra y Gales con el número de registro 15657271',office:'y su domicilio social está en 71–75 Sheldon Street, London WC2H 9JQ, Reino Unido.',rights:'© 2026 Hub Carbon. Todos los derechos reservados.',privacy:'Privacidad y cookies',settings:'Configuración de cookies',title:'Su privacidad importa.',copy:'Hub Carbon utiliza actualmente solo almacenamiento esencial para mantener el sitio en funcionamiento y recordar su elección de privacidad. Actualmente no utilizamos cookies de análisis ni de publicidad.',link:'Lea nuestro aviso de Privacidad y Cookies',continue:'Continuar solo con lo esencial'},
    fr:{legal:'Hub Carbon Limited est une société enregistrée en Angleterre et au Pays de Galles sous le numéro 15657271',office:'et son siège social est situé au 71–75 Sheldon Street, London WC2H 9JQ, Royaume-Uni.',rights:'© 2026 Hub Carbon. Tous droits réservés.',privacy:'Confidentialité et cookies',settings:'Paramètres des cookies',title:'Votre vie privée compte.',copy:'Hub Carbon utilise actuellement uniquement un stockage essentiel pour assurer le fonctionnement du site et mémoriser votre choix de confidentialité. Nous n’utilisons actuellement aucun cookie d’analyse ou de publicité.',link:'Lire notre avis Confidentialité et Cookies',continue:'Continuer avec l’essentiel uniquement'}
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
    const banner=document.querySelector('#cookie-banner');
    if(banner && t.title){
      const title=banner.querySelector('.cookie-title'); if(title) title.textContent=t.title;
      const copy=banner.querySelector('.cookie-copy'); if(copy){copy.childNodes.forEach(n=>{if(n.nodeType===Node.TEXT_NODE && n.nodeValue.includes('Hub Carbon currently uses only essential storage to keep the website working and remember your privacy choice. We do not currently use analytics or advertising cookies.')) n.nodeValue=t.copy+' ';}); const link=copy.querySelector('a'); if(link){link.textContent=t.link;}}
      const essential=banner.querySelector('[data-cookie-essential]'); if(essential) essential.textContent=t.continue;
      const eyebrow=banner.querySelector('.cookie-eyebrow'); if(eyebrow) eyebrow.textContent=t.privacy;
    }
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
