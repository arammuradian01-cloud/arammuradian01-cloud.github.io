/* Mixtell — лид-формы (согласия + фиксация доказательств), WL-виджеты, nav, телефон. */
(function(){
  var CFG = window.MIXTELL || {};

  /* client_id (обезличенный) — для affSub2 и связи заявки, БЕЗ ПДн */
  function clientId(){
    var k="mtl_cid", m=document.cookie.match(/(?:^|; )mtl_cid=([^;]*)/);
    if(m) return m[1];
    var id="c"+Math.random().toString(36).slice(2)+Date.now().toString(36);
    document.cookie=k+"="+id+"; path=/; max-age="+(365*864e5/1e3)+"; SameSite=Lax";
    return id;
  }

  /* Подстановка реквизитов/контактов в data-mx слоты */
  function fillOrgSlots(){
    document.querySelectorAll("[data-mx]").forEach(function(el){
      var key=el.getAttribute("data-mx"), o=CFG.org||{};
      var map={phone:o.phone,phoneHref:"tel:"+(o.phoneHref||""),email:o.email,
        emailHref:"mailto:"+(o.email||""),privacyEmail:o.privacyEmail,
        privacyEmailHref:"mailto:"+(o.privacyEmail||""),name:o.name,inn:o.inn,ogrn:o.ogrn,
        address:o.address,checkedDate:CFG.checkedDate,docsDate:CFG.docsDate,docsVersion:CFG.docsVersion,
        director:o.director};
      var v=map[key]; if(v==null) return;
      if(el.tagName==="A"&&(key==="phone"||key==="email"||key==="privacyEmail")){ el.textContent=v; }
      else if(key.slice(-4)==="Href"){ el.setAttribute("href",v); }
      else el.textContent=v;
    });
  }

  /* Мобильное меню (бренд-дизайн: бургер → выезжающая панель mmenu) */
  function initNav(){
    var b=document.getElementById("burger"), mm=document.getElementById("mmenu"),
        sc=document.getElementById("mscrim"), mc=document.getElementById("mclose");
    if(!b||!mm||!sc) return;
    function open(){ mm.classList.add("open"); sc.classList.add("open"); }
    function close(){ mm.classList.remove("open"); sc.classList.remove("open"); }
    b.addEventListener("click",open);
    if(mc) mc.addEventListener("click",close);
    sc.addEventListener("click",close);
    mm.addEventListener("click",function(e){ if(e.target.tagName==="A") close(); });
  }

  /* Отправка лид-формы: согласие (а) обязательно, (б)/(д) — отдельные и опциональные */
  function submitLead(form){
    var msg=form.querySelector(".form-msg");
    var required=form.querySelector('[data-consent="data"]');
    if(required && !required.checked){
      show(msg,"err","Чтобы отправить заявку, отметьте согласие на обработку персональных данных.");
      return;
    }
    var payload={ form_id:form.getAttribute("data-form")||"lead", client_id:clientId(),
      page_url:location.href, ts:new Date().toISOString(), consents:{}, fields:{} };
    form.querySelectorAll("input,select,textarea").forEach(function(el){
      if(el.type==="checkbox"){ if(el.hasAttribute("data-consent")) payload.consents[el.getAttribute("data-consent")]=el.checked; }
      else if(el.name){ payload.fields[el.name]=el.value; }
    });
    payload.consent_text_version=CFG.docsVersion||"2.0";

    if(window.__mixtellTrack) window.__mixtellTrack("lead_submit");

    function mailtoFallback(){
      // Тестовая передача заявок на почту (до подключения CRM): открывает почтовый клиент.
      var f=payload.fields||{}, to=CFG.leadEmail||"aram@mixtell.ru";
      var pr=f.product||payload.form_id||"Заявка";
      var subj="Заявка с сайта Микстелл: "+pr;
      var body="Продукт: "+pr+"\r\nИмя: "+(f.name||f.fio||"")+"\r\nТелефон: "+(f.phone||f.tel||"")+
               "\r\nСтраница: "+location.href;
      window.location.href="mailto:"+to+"?subject="+encodeURIComponent(subj)+"&body="+encodeURIComponent(body);
      show(msg,"ok","Заявка сформирована — отправьте письмо в открывшемся почтовом клиенте. Персональный менеджер перезвонит за 15 минут.");
      form.reset();
    }
    if(CFG.leadEndpoint){
      var btn=form.querySelector('[type="submit"]'); if(btn){btn.disabled=true;}
      fetch(CFG.leadEndpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})
        .then(function(r){ if(!r.ok) throw 0;
          show(msg,"ok","Заявка принята. Персональный менеджер перезвонит в течение 15 минут."); form.reset(); })
        .catch(function(){ mailtoFallback(); })
        .finally(function(){ if(btn) btn.disabled=false; });
    } else {
      // Пока CRM не подключена — заявка уходит на почту aram@mixtell.ru (тестовый режим).
      mailtoFallback();
    }
  }
  function show(el,cls,text){ if(!el)return; el.className="form-msg "+cls; el.textContent=text; }

  function initForms(){
    document.querySelectorAll("form.mx-lead").forEach(function(f){
      f.addEventListener("submit",function(e){ e.preventDefault(); submitLead(f); });
    });
  }

  /* Партнёрский CTA: если есть go-ссылка — ведём на партнёра с affSub2/out; иначе — к форме перезвона */
  function initPartnerCTA(){
    document.querySelectorAll("[data-sravni]").forEach(function(el){
      var key=el.getAttribute("data-sravni");
      var link=((CFG.sravni||{}).links||{})[key]||"";
      if(link){
        var url=link.replace("{client_id}",encodeURIComponent(clientId()))
                    .replace("{OUT}","").replace("{client_id}",clientId());
        el.setAttribute("href",url); el.setAttribute("rel","nofollow sponsored");
        el.setAttribute("target","_blank");
        el.addEventListener("click",function(){ if(window.__mixtellTrack) window.__mixtellTrack("partner_"+key); });
      } else {
        // офферы не согласованы -> мягкая конверсия
        el.setAttribute("href","#zayavka");
        el.addEventListener("click",function(){ var t=document.getElementById("zayavka"); if(t){t.scrollIntoView({behavior:"smooth"});} });
      }
    });
  }

  /* Маркировка рекламы: показываем только если есть реальный erid */
  function initAdMarks(){
    document.querySelectorAll("[data-erid]").forEach(function(el){
      var key=el.getAttribute("data-erid");
      var erid=((CFG.ads||{}).erid||{})[key]||"";
      if(erid){
        el.textContent="Реклама. "+(CFG.ads.advertiser||"")+", ИНН "+(CFG.ads.advertiserInn||"")+". erid: "+erid;
        el.classList.remove("hide");
      } else { el.classList.add("hide"); }
    });
  }

  /* White Label Сравни: рендер внутри страницы, либо аккуратная заглушка */
  function initWL(){
    document.querySelectorAll("[data-wl]").forEach(function(slot){
      var key=slot.getAttribute("data-wl");
      var cfg=((CFG.wl||{}).products||{})[key];
      if(cfg && cfg.enabled){
        slot.innerHTML="";
        var s=document.createElement("script");
        s.src=CFG.wl.loader; s.async=true;
        /* Атрибуты строго по коду из кабинета Сравни для ЭТОГО продукта — у каждого свой набор */
        s.setAttribute("data-product",cfg.product);
        var attrs=cfg.attrs||{};
        Object.keys(attrs).forEach(function(name){ s.setAttribute(name,attrs[name]); });
        s.setAttribute("data-offer_id",cfg.offer_id);
        s.setAttribute("data-source",CFG.wl.source);
        s.setAttribute("data-aff_id",CFG.wl.aff_id);
        slot.appendChild(s);
      } else {
        slot.innerHTML='<div class="wl-fallback muted">Онлайн-расчёт по этому продукту скоро заработает. '+
          'Оставьте телефон — оператор перезвонит за 15 минут и посчитает вручную. '+
          '<a href="#zayavka">Оставить заявку →</a></div>';
      }
    });
  }

  function boot(){ fillOrgSlots(); initNav(); initForms(); initPartnerCTA(); initAdMarks(); initWL(); }
  if(document.readyState!=="loading") boot();
  else document.addEventListener("DOMContentLoaded",boot);
})();
