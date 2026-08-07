/* Mixtell — cookie-согласие и подключение аналитики ТОЛЬКО после согласия.
   Реализует п.5–6 юр-требований: до согласия ни Метрика, ни VK не грузятся;
   выбор хранится в cookie mtl_consent и логируется; поля ПДн исключаются из Вебвизора. */
(function(){
  var CFG = window.MIXTELL || {};
  var COOKIE = "mtl_consent";
  var VER = "2.0";

  function readConsent(){
    var m = document.cookie.match(/(?:^|; )mtl_consent=([^;]*)/);
    if(!m) return null;
    try{ return JSON.parse(decodeURIComponent(m[1])); }catch(e){ return null; }
  }
  function writeConsent(obj){
    obj.v = VER; obj.ts = new Date().toISOString();
    var val = encodeURIComponent(JSON.stringify(obj));
    var exp = new Date(Date.now()+180*864e5).toUTCString();
    document.cookie = COOKIE+"="+val+"; path=/; expires="+exp+"; SameSite=Lax";
    logConsent("cookie", obj);
  }
  // Фиксация доказательства согласия (п.4). Пусто => буферизуем в консоль (dev).
  function logConsent(type, payload){
    var body = { consent_type:type, consent_text_version:VER, granted:payload,
      page_url:location.href, ts:new Date().toISOString() };
    if(CFG.leadEndpoint){
      try{ navigator.sendBeacon(CFG.leadEndpoint.replace(/\/leads$/, "/consents"),
        new Blob([JSON.stringify(body)],{type:"application/json"})); }catch(e){}
    } else if(window.console){ console.debug("[consent]", body); }
  }

  /* ---- Аналитика (инжектится строго после согласия) ---- */
  var loaded = { metrika:false, vk:false };
  function loadMetrika(){
    if(loaded.metrika || !CFG.metrikaId) return; loaded.metrika = true;
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();
      for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
      k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a);
    })(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
    // Вебвизор ВКЛ, но поля с ПДн исключены классом ym-disable-keys / атрибутом (см. forms.js, разметку)
    ym(CFG.metrikaId,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
    window.__mixtellTrack = function(goal){ try{ ym(CFG.metrikaId,"reachGoal",goal); }catch(e){} };
  }
  function loadVK(){
    if(loaded.vk || !CFG.vkPixelId) return; loaded.vk = true;
    var t=document.createElement("script");t.type="text/javascript";t.async=true;
    t.src="https://vk.com/js/api/openapi.js?169";
    t.onload=function(){ try{ if(window.VK&&VK.Retargeting){VK.Retargeting.Init(CFG.vkPixelId);VK.Retargeting.Hit();} }catch(e){} };
    document.head.appendChild(t);
  }
  function applyConsent(c){
    if(!c) return;
    if(c.analytics) loadMetrika();
    if(c.marketing) loadVK();
  }

  /* ---- Баннер ---- */
  function buildBanner(){
    if(readConsent()){ applyConsent(readConsent()); return; }
    var b = document.createElement("div");
    b.className = "cookie-banner"; b.id = "cookieBanner";
    b.setAttribute("role","dialog"); b.setAttribute("aria-label","Настройки cookie");
    b.innerHTML =
      '<p>Мы используем cookie: необходимые — для работы сайта, а с вашего согласия — '+
      'аналитические (Яндекс.Метрика) и маркетинговые (рекламные пиксели). Подробнее — '+
      'в <a href="/cookie/">Политике cookie</a>.</p>'+
      '<div class="cookie-actions">'+
        '<button class="btn btn-primary" data-cc="all">Принять все</button>'+
        '<button class="btn btn-ghost" data-cc="need">Только необходимые</button>'+
        '<button class="btn btn-ghost" data-cc="toggle">Настроить</button>'+
      '</div>'+
      '<div class="cookie-settings" id="cookieSettings">'+
        '<div class="cookie-opt"><input type="checkbox" checked disabled><div class="t"><b>Необходимые</b>'+
          '<small>Всегда включены — вход, безопасность, запоминание выбора cookie.</small></div></div>'+
        '<div class="cookie-opt"><input type="checkbox" id="ccAnalytics"><div class="t"><b>Аналитические</b>'+
          '<small>Яндекс.Метрика — как вы пользуетесь сайтом. Персональные данные не передаются.</small></div></div>'+
        '<div class="cookie-opt"><input type="checkbox" id="ccMarketing"><div class="t"><b>Маркетинговые</b>'+
          '<small>Рекламные пиксели (VK) — чтобы показывать релевантные предложения.</small></div></div>'+
        '<button class="btn btn-primary" data-cc="save">Сохранить выбор</button>'+
      '</div>';
    document.body.appendChild(b);
    requestAnimationFrame(function(){ b.classList.add("show"); });

    b.addEventListener("click", function(e){
      var act = e.target.getAttribute("data-cc"); if(!act) return;
      if(act==="all"){ save({analytics:true,marketing:true}); }
      else if(act==="need"){ save({analytics:false,marketing:false}); }
      else if(act==="toggle"){ document.getElementById("cookieSettings").classList.toggle("show"); }
      else if(act==="save"){
        save({ analytics:document.getElementById("ccAnalytics").checked,
               marketing:document.getElementById("ccMarketing").checked });
      }
    });
    function save(c){ writeConsent(c); applyConsent(c); b.classList.remove("show"); setTimeout(function(){b.remove();},250); }
  }

  // Ссылка «Настройки cookie» в футере — пересобрать баннер
  window.mixtellOpenCookieSettings = function(){
    var ex = document.getElementById("cookieBanner"); if(ex) ex.remove();
    document.cookie = COOKIE+"=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    buildBanner();
    var s = document.getElementById("cookieSettings"); if(s) s.classList.add("show");
  };

  if(document.readyState!=="loading") buildBanner();
  else document.addEventListener("DOMContentLoaded", buildBanner);
})();
