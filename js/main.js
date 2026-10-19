/* Accessible navigation uses the same labels and links on every screen. */
(function () {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  if (!button || !nav) return;
  document.documentElement.classList.add('nav-ready');
  const close = (restoreFocus = false) => {
    nav.classList.remove('is-open');
    button.setAttribute('aria-expanded', 'false');
    if (restoreFocus) button.focus();
  };
  button.addEventListener('click', () => {
    const open = button.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    button.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('is-open')) close(true); });
  document.addEventListener('click', e => { if (!nav.contains(e.target) && !button.contains(e.target)) close(); });
  const breakpoint = window.matchMedia('(min-width: 1101px)');
  breakpoint.addEventListener('change', () => close());
})();

/* No tracker, cookies, storage or network calls: disabled integration hook.
   A future provider must be configured only after its privacy/consent review. */
function hubCarbonMetric(event, fields = {}) {
  if (typeof window.hubCarbonMetrics !== 'function') return;
  const lang = (document.documentElement.lang || 'en').slice(0, 2);
  try { window.hubCarbonMetrics({event, lang, ...fields}); } catch (_) { /* Measurement must not interrupt the visitor. */ }
}
document.addEventListener('click', e => {
  const link = e.target.closest('[data-cta]');
  if (link) hubCarbonMetric('cta_click', {cta: link.dataset.cta});
});

/* Existing Formspree endpoint; progressive enhancement over native POST. */
(function () {
  const form = document.querySelector('#contact-form');
  if (!form) return;
  const language = (document.documentElement.lang || 'en').slice(0, 2);
  const text = {
    en: {sending:'Sending…', success:'Your enquiry has been sent. Thank you. We will contact you to discuss next steps.', error:'We could not confirm delivery. Your information is still here. Please try again or email info@hubcarbon.com.'},
    pt: {sending:'Enviando…', success:'Seu contato foi enviado. Obrigado. Entraremos em contato para conversar sobre os próximos passos.', error:'Não foi possível confirmar o envio. Suas informações foram preservadas. Tente novamente ou escreva para info@hubcarbon.com.'},
    es: {sending:'Enviando…', success:'Su consulta se ha enviado. Gracias. Contactaremos con usted para hablar de los próximos pasos.', error:'No pudimos confirmar el envío. Sus datos se han conservado. Inténtelo de nuevo o escriba a info@hubcarbon.com.'},
    fr: {sending:'Envoi en cours…', success:'Votre demande a été envoyée. Merci. Nous vous contacterons pour discuter de la suite.', error:'Nous n’avons pas pu confirmer l’envoi. Vos informations sont conservées. Réessayez ou écrivez à info@hubcarbon.com.'}
  }[language];
  const messages = text || {sending:'Sending…', success:'Your enquiry has been sent.', error:'Please try again or email info@hubcarbon.com.'};
  const topic = form.elements.namedItem('topic');
  const allowed = ['intelligence','decarbonisation','projects','markets','finance','partnership','other'];
  const selected = new URLSearchParams(window.location.search).get('topic');
  if (allowed.includes(selected)) topic.value = selected;
  let started = false;
  form.addEventListener('input', () => { if (!started) { started = true; hubCarbonMetric('form_start'); } });
  if (!window.fetch || !window.FormData || !window.AbortController) return;
  const button = form.querySelector('[type="submit"]');
  const status = form.querySelector('#form-status');
  let sending = false;
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (sending || !form.reportValidity()) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    const label = button.textContent;
    sending = true; button.disabled = true; button.textContent = messages.sending;
    form.setAttribute('aria-busy', 'true'); status.textContent = messages.sending;
    try {
      const response = await fetch(form.action, {method:'POST', body:new FormData(form), headers:{Accept:'application/json'}, signal:controller.signal});
      const result = await response.json().catch(() => null);
      if (!response.ok || !result || (result.errors && result.errors.length)) throw new Error('Unconfirmed enquiry');
      status.textContent = messages.success; status.className = 'form-status is-success';
      hubCarbonMetric('form_success', {topic: allowed.includes(topic.value) ? topic.value : 'other'});
      form.reset(); started = false;
    } catch (_) {
      status.textContent = messages.error; status.className = 'form-status is-error';
      hubCarbonMetric('form_error');
    } finally {
      clearTimeout(timeout); sending = false; button.disabled = false; button.textContent = label;
      form.removeAttribute('aria-busy'); status.focus();
    }
  });
})();

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
  let settingsTrigger = null;
  let backgroundState = [];
  const openSettings=()=>{
    settingsTrigger = document.activeElement;
    const modal=document.querySelector('#cookie-settings');
    if(modal){
      backgroundState = [...document.body.children].filter(el => el !== modal && !['SCRIPT','STYLE'].includes(el.tagName)).map(el => [el, el.inert]);
      backgroundState.forEach(([el]) => { el.inert = true; });
      modal.hidden=false;document.body.classList.add('cookie-modal-open');modal.querySelector('.cookie-close')?.focus();
    }
  };
  const closeSettings=()=>{
    const modal=document.querySelector('#cookie-settings');
    if(modal){modal.hidden=true;document.body.classList.remove('cookie-modal-open');
      backgroundState.forEach(([el, wasInert]) => { el.inert = wasInert; });
      backgroundState = [];
      if(settingsTrigger?.isConnected && !settingsTrigger.closest('[hidden]')) settingsTrigger.focus();
      else document.querySelector('footer [data-cookie-settings]')?.focus();
    }
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
    document.addEventListener('keydown', e => {
      if (!settings || settings.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); closeSettings(); }
      if (e.key !== 'Tab') return;
      const controls = [...settings.querySelectorAll('button, a[href], input, select, textarea, [tabindex="0"]')].filter(el => !el.disabled && !el.hidden);
      const first = controls[0], last = controls[controls.length - 1];
      if (!first) return;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
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
