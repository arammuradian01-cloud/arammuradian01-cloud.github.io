/* Микстелл — калькуляторы (§9). Рендерятся в слоты [data-calc].
   Вклад+налог и кредит — точная математика. ОСАГО — ОРИЕНТИРОВОЧНАЯ оценка по
   официальной формуле ЦБ (коэффициенты — из указания ЦБ; базовый тариф — коридор
   1 399–8 665 ₽, внутри которого цену выбирает страховая). Точную цену даёт расчёт
   партнёра/страховой — калькулятор её не заменяет и не является офертой. */
(function(){
  "use strict";
  function money(n){ return new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₽"; }
  function num(el){ return parseFloat((el.value||"").toString().replace(/\s/g,"").replace(",",".")) || 0; }
  function opt(list,sel){ return list.map(function(o){return '<option value="'+o[1]+'"'+(o[2]?' selected':'')+'>'+o[0]+'</option>';}).join(""); }

  /* ---------- Вклад + налог с вклада ---------- */
  function vklad(root){
    root.className="calc";
    root.innerHTML=
      '<div class="crow">'+
        '<div><label class="fld">Сумма вклада, ₽</label><input class="inp" id="v-sum" inputmode="numeric" value="1 000 000"></div>'+
        '<div><label class="fld">Ставка, % годовых</label><input class="inp" id="v-rate" inputmode="decimal" value="12,85"></div>'+
        '<div><label class="fld">Срок, месяцев</label><input class="inp" id="v-term" inputmode="numeric" value="12"></div>'+
      '</div>'+
      '<div class="out"><div class="cap">Доход и налог за срок вклада</div>'+
        '<div class="big" id="v-net">—</div>'+
        '<div class="brk" id="v-brk"></div></div>'+
      '<p class="chint">Необлагаемый минимум по вкладам за 2026 год — <b>160 000 ₽</b> процентного дохода '+
      'суммарно по всем вашим вкладам во всех банках (1 млн ₽ × максимальная ключевая ставка на 1-е число месяца). '+
      'С дохода сверх минимума — НДФЛ 13% (15% с части свыше 2,4 млн ₽ дохода за год). Расчёт по простой ставке, '+
      'ориентировочный: банк может считать с ежемесячной капитализацией. Ключевая ставка ЦБ сейчас 14,00%.</p>';
    function calc(){
      var s=num(root.querySelector("#v-sum")), r=num(root.querySelector("#v-rate")), t=num(root.querySelector("#v-term"));
      var income = s * (r/100) * (t/12);
      var taxable = Math.max(0, income - 160000);
      var tax = taxable*0.13;
      root.querySelector("#v-net").textContent = money(income - tax) + " на руки";
      root.querySelector("#v-brk").innerHTML =
        "Доход за срок: <b>"+money(income)+"</b> · налог НДФЛ: <b>"+money(tax)+"</b>"+
        (taxable>0 ? " (облагается "+money(taxable)+" сверх минимума)" : " (доход в пределах необлагаемого минимума)");
    }
    root.querySelectorAll("input").forEach(function(i){ i.addEventListener("input",calc); });
    calc();
  }

  /* ---------- Кредитный калькулятор (аннуитет) ---------- */
  function kredit(root){
    root.className="calc";
    root.innerHTML=
      '<div class="crow">'+
        '<div><label class="fld">Сумма кредита, ₽</label><input class="inp" id="k-sum" inputmode="numeric" value="500 000"></div>'+
        '<div><label class="fld">Ставка, % годовых</label><input class="inp" id="k-rate" inputmode="decimal" value="24,9"></div>'+
        '<div><label class="fld">Срок, месяцев</label><input class="inp" id="k-term" inputmode="numeric" value="36"></div>'+
      '</div>'+
      '<div class="out"><div class="cap">Ежемесячный платёж</div>'+
        '<div class="big" id="k-pay">—</div>'+
        '<div class="brk" id="k-brk"></div></div>'+
      '<p class="chint">Расчёт аннуитетного платежа по ставке. Реальная <b>полная стоимость кредита (ПСК)</b> обычно '+
      'выше ставки за счёт страховок и комиссий — средняя ПСК по рынку сейчас ~29,9%. Банк обязан показать ПСК в '+
      'договоре; сравнивайте предложения именно по ПСК, а не по «ставке от».</p>';
    function calc(){
      var s=num(root.querySelector("#k-sum")), r=num(root.querySelector("#k-rate")), n=num(root.querySelector("#k-term"));
      var i=r/100/12, pay;
      if(n<=0){ pay=0; } else if(i===0){ pay=s/n; } else { pay = s*i/(1-Math.pow(1+i,-n)); }
      var total=pay*n, over=total-s;
      root.querySelector("#k-pay").textContent = money(pay) + "/мес";
      root.querySelector("#k-brk").innerHTML =
        "Всего выплатите: <b>"+money(total)+"</b> · переплата: <b>"+money(over)+"</b> за "+n+" мес.";
    }
    root.querySelectorAll("input").forEach(function(i){ i.addEventListener("input",calc); });
    calc();
  }

  /* ---------- ОСАГО (ориентировочная оценка по формуле ЦБ) ---------- */
  function osago(root){
    root.className="calc";
    // КМ — мощность (л.с.); КВС — возраст/стаж; КО — ограничения; КБМ — класс скидки; КТ — территория.
    var KM=[["до 50 л.с.","0.6"],["51–70 л.с.","1.0",1],["71–100 л.с.","1.1"],["101–120 л.с.","1.2"],["121–150 л.с.","1.4"],["свыше 150 л.с.","1.6"]];
    var KVS=[["до 22 лет, стаж до 3 лет","1.8"],["23–29 лет, стаж до 5 лет","1.17"],["30–39 лет, стаж 5–9 лет","1.0",1],["40+ лет, стаж 10+ лет","0.9"]];
    var KO=[["Ограниченный список водителей","1.0",1],["Без ограничений","1.94"]];
    var KBM=[["Класс 13 — макс. скидка (0.50)","0.50"],["Скидка за безаварийность (0.78)","0.78"],["Класс 3 — базовый, новый водитель (1.0)","1.0",1],["Была авария (1.17)","1.17"],["Несколько аварий (1.55)","1.55"]];
    var KT=[["Москва (~1.8)","1.8"],["Санкт-Петербург (~1.64)","1.64"],["Крупный город (~1.3)","1.3",1],["Областной центр (~1.0)","1.0"],["Малый город/район (~0.7)","0.7"]];
    root.innerHTML=
      '<div class="crow">'+
        '<div><label class="fld">Мощность двигателя</label><select class="inp" id="o-km">'+opt(KM)+'</select></div>'+
        '<div><label class="fld">Возраст и стаж водителя</label><select class="inp" id="o-kvs">'+opt(KVS)+'</select></div>'+
      '</div>'+
      '<div class="crow">'+
        '<div><label class="fld">Кто за рулём</label><select class="inp" id="o-ko">'+opt(KO)+'</select></div>'+
        '<div><label class="fld">Ваш класс КБМ (скидка)</label><select class="inp" id="o-kbm">'+opt(KBM)+'</select></div>'+
      '</div>'+
      '<div class="crow">'+
        '<div><label class="fld">Регион регистрации (КТ)</label><select class="inp" id="o-kt">'+opt(KT)+'</select></div>'+
      '</div>'+
      '<div class="out"><div class="cap">Ориентировочная цена полиса ОСАГО</div>'+
        '<div class="big" id="o-res">—</div>'+
        '<div class="brk" id="o-brk"></div></div>'+
      '<p class="chint"><b>Это оценка, а не оферта.</b> Считаем по официальной формуле ЦБ: базовый тариф × КТ × КБМ × КВС × КМ × КО. '+
      'Базовый тариф для легковых авто физлиц закон разрешает страховой выбирать в коридоре <b>1 399–8 665 ₽</b>, поэтому итог — '+
      'диапазон. КТ и коэффициенты зависят от точных данных (регион до города, стаж по правам). Средняя цена полиса по рынку — 7 555 ₽. '+
      'Точную цену в 20+ компаниях покажет <a href="#raschet">онлайн-расчёт</a> или персональный менеджер за 15 минут.</p>';
    function calc(){
      function v(id){ return parseFloat(root.querySelector(id).value)||1; }
      var k = v("#o-km")*v("#o-kvs")*v("#o-ko")*v("#o-kbm")*v("#o-kt");
      var low=1399*k, high=8665*k, mid=7555*v("#o-kbm")/1.0; // ориентир вокруг рыночной средней с учётом КБМ
      root.querySelector("#o-res").textContent = money(low) + " – " + money(high);
      root.querySelector("#o-brk").innerHTML = "Типичная цена для такого профиля — около <b>"+money(Math.min(Math.max(mid,low),high))+"</b>. "+
        "Итог зависит от базового тарифа конкретной страховой.";
    }
    root.querySelectorAll("select").forEach(function(s){ s.addEventListener("change",calc); });
    calc();
  }

  /* ---------- Проверка/восстановление КБМ (инструмент + объяснение) ---------- */
  function kbm(root){
    root.className="calc";
    var CLS=[["Класс 3 — новый водитель","1.0","3"],["Класс 4","0.95","4"],["Класс 5","0.9","5"],
      ["Класс 6","0.85","6"],["Класс 7","0.8","7"],["Класс 8","0.75","8"],["Класс 9","0.7","9"],
      ["Класс 10","0.65","10"],["Класс 11","0.6","11"],["Класс 12","0.55","12"],["Класс 13 — макс. скидка","0.5","13"]];
    root.innerHTML=
      '<div class="crow">'+
        '<div><label class="fld">Ваш текущий класс КБМ</label><select class="inp" id="b-cls">'+
          CLS.map(function(o){return '<option value="'+o[1]+'"'+(o[2]==="3"?' selected':'')+'>'+o[0]+' — коэф. '+o[1]+'</option>';}).join("")+
        '</select></div>'+
        '<div><label class="fld">Аварий по вашей вине за год</label><select class="inp" id="b-acc">'+
          '<option value="0" selected>0 — ездил без аварий</option><option value="1">1 авария</option><option value="2">2 и более</option>'+
        '</select></div>'+
      '</div>'+
      '<div class="kbm-out">'+
        '<div class="kb"><b id="b-now">1.0</b><span>текущий коэффициент</span></div>'+
        '<div class="kb"><b id="b-next">—</b><span>станет через год</span></div>'+
        '<div class="kb"><b id="b-eff">—</b><span>влияние на цену</span></div>'+
      '</div>'+
      '<p class="chint">За каждый год без аварий класс растёт и скидка увеличивается (минимум — коэффициент 0,5, это −50%). '+
      'Одна авария по вашей вине откидывает КБМ на несколько классов вверх (дороже). <b>Как вернуть скидку, если её потеряли '+
      'из-за ошибки:</b> проверьте свой КБМ в системе НСИС (бывш. АИС ОСАГО), и если он занижен по ошибке страховой — подайте '+
      'заявление на восстановление в свою страховую или жалобу в Банк России. Проверить КБМ бесплатно можно на '+
      '<a href="https://nsis.ru/" target="_blank" rel="noopener">портале НСИС</a>. Точный класс страховая берёт из НСИС при расчёте.</p>';
    function calc(){
      var now=parseFloat(root.querySelector("#b-cls").value)||1;
      var acc=parseInt(root.querySelector("#b-acc").value,10);
      var next;
      if(acc===0){ next=Math.max(0.5, Math.round((now-0.05)*100)/100); }
      else if(acc===1){ next=Math.min(2.45, Math.round((now+0.4)*100)/100); }
      else { next=Math.min(3.92, Math.round((now+0.9)*100)/100); }
      root.querySelector("#b-now").textContent=now.toFixed(2);
      root.querySelector("#b-next").textContent=next.toFixed(2);
      var diff=Math.round((next/now-1)*100);
      root.querySelector("#b-eff").textContent=(diff===0?"без изменений":(diff>0?"+"+diff+"% дороже":diff+"% дешевле"));
    }
    root.querySelectorAll("select").forEach(function(s){ s.addEventListener("change",calc); });
    calc();
  }

  var MAP={ vklad:vklad, kredit:kredit, osago:osago, kbm:kbm };
  function boot(){
    document.querySelectorAll("[data-calc]").forEach(function(el){
      var fn=MAP[el.getAttribute("data-calc")]; if(fn) fn(el);
    });
  }
  if(document.readyState!=="loading") boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
