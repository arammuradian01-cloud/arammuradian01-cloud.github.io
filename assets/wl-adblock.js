/* Обход AdBlock для White Label «Сравни».
   Код предоставлен партнёром (кабинет Сравни → Виджеты → Готовый код).
   Должен подключаться в <head> на страницах, где рендерится WL. */
(function () {
  var BASE_URL = "https://s91588.cdn.ngenix.net/affiliates-frontend/public/a/";
  var SALT = "Maish1wu1thua7ee";

  function encodeString(e) {
    var t = 2166136261;
    for (var n = 0; n < e.length; n++) {
      var a = e.charCodeAt(n);
      t ^= a; t *= 16777619; t ^= a << (n % 16);
    }
    t += 3 * e.length;
    var r = (t >>>= 0).toString(16);
    while (r.length < 8) r = "0" + r;
    return r;
  }

  document.addEventListener("DOMContentLoaded", function () {
    try {
      var e = new Date().toLocaleString("ru-RU", { month: "long", year: "numeric" }).toLowerCase();
      var t = encodeString(e + SALT);
      var n = document.createElement("script");
      n.src = BASE_URL + t + ".js";
      n.async = true;
      document.body.appendChild(n);
    } catch (a) {
      console.error(a.message);
    }
  });
})();
