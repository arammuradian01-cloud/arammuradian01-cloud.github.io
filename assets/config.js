/* =====================================================================
   Mixtell — ЕДИНЫЙ КОНФИГ САЙТА.  Здесь и ТОЛЬКО здесь меняются боевые значения.
   Всё, что помечено  // ⚠️ ВСТАВИТЬ  — подставить перед публичным запуском.
   Пустое значение => функция деградирует безопасно (CTA ведёт на заявку-перезвон,
   аналитика/erid не показываются).  Ничего не выдумано — реальные значения там,
   где они у нас есть (реквизиты, контакты, согласованные offer_id, WL-скрипты).
   Аккаунт Сравни — 101340 / площадка 10645 (профиль «Евгений», aram@mixtell.ru).
   Старый аккаунт 101282 / 10643 — НЕ используется нигде.
   ===================================================================== */
window.MIXTELL = {
  /* --- Организация (боевые реквизиты ООО «МИКСТЕЛЛ») --- */
  org: {
    name: "ООО «МИКСТЕЛЛ»",
    inn: "7751182580",
    ogrn: "1207700231111",
    address: "108802, г. Москва, р-н Коммунарка, д. Сосенки, ул. Ясеневая, д. 5, к. 1, этаж/офис 1/XI",
    email: "info@mixtell.ru",
    privacyEmail: "privacy@mixtell.ru",
    phone: "+7 (499) 391-06-30",
    phoneHref: "+74993910630",
    director: "Абрамова Юлия Николаевна"
  },

  /* --- Даты «проверено» и редакции документов --- */
  checkedDate: "05.08.2026",      // подставляется в «проверено {дата}» и дисклеймеры
  docsVersion: "2.0",
  docsDate: "05.08.2026",

  /* --- Приём заявок (мини-CRM, SLA 15 минут) ---
     Пусто => форма покажет телефон/почту (fallback). Впишите боевой endpoint API. */
  leadEndpoint: "",               // ⚠️ ВСТАВИТЬ URL CRM после установки, напр. "https://api.mixtell.ru/api/lead"
  leadEmail: "aram@mixtell.ru",   // тестовый приём заявок на почту, пока CRM не подключена
  osagoApplyUrl: (window.MX_BASE||"/")+"osago/apply/", // своя анкета ОСАГО (мини-CRM)

  /* --- Аналитика (грузится ТОЛЬКО после согласия в cookie-баннере) ---
     Пусто => счётчики не подключаются (мы не подставляем несуществующие ID). */
  metrikaId: "",                  // ⚠️ ВСТАВИТЬ id счётчика Яндекс.Метрики
  vkPixelId: "",                  // ⚠️ ВСТАВИТЬ id пикселя VK Реклама

  /* --- Партнёрские go-ссылки Сравни (редирект-fallback) ---
     Шаблон: https://go.sravni.ru/aff_c?aff_id=101340&offer_id={OFFER}&source=10645&out={OUT}&affSub2={client_id}
     Пусто => CTA ведёт на форму перезвона, пока go-ссылки не согласованы/не выданы. */
  sravni: {
    aff_id: "101340",
    source: "10645",
    links: {
      kasko: "",                    // ⚠️ WL у Сравни нет — перезвон/подбор
      strahovanie_ipoteki: "",      // используется WL-виджет (ниже), go-ссылка не нужна
      strahovanie_kvartiry: "",     // используется WL-виджет (ниже)
      ns: "",                       // используется WL-виджет (ниже)
      vzr: "",                      // используется WL-виджет (ниже)
      kleshch: "",                  // используется WL-виджет (ниже)
      kredity: "",                  // используется WL-виджет (ниже, 1580)
      zaimy: "",                    // используется WL-виджет (ниже, 1580)
      karty_kreditnye: "",          // используется WL-виджет (ниже, 1629 — живой)
      karty_debetovye: "",          // ⚠️ WL/оффера у Сравни нет — перезвон/подбор
      vklady: "",                   // ⚠️ оффера у Сравни нет — только форма + калькулятор
      ipoteka: ""                   // ⚠️ WL кредит-ипотеки нет — перезвон/подбор
    }
  },

  /* --- White Label Сравни (аккаунт 101340, площадка 10645, бренд teal) ---
     Реальные параметры из кабинета. Виджет рендерится ВНУТРИ страницы по скроллу.
     ⚠️ Домен витрины должен быть зарегистрирован площадке 10645 (Площадки → домен),
        иначе виджет не грузится (фильтр по referer). На демо-домене будет пусто — это ок.
     status: 'live' — оффер одобрен, рендерится живьём;
             'moderation' — на модерации, виджет ставим, пока пустой (§5, это НЕ баг),
                            конверсию дублирует мягкая лид-форма «закрепить менеджера».
     enabled:false => показываем аккуратную заглушку «расчёт скоро». */
  wl: {
    loader: "https://www.sravni.ru/widgets/loader.js",
    aff_id: "101340",
    source: "10645",
    /* ⚠️ ВАЖНО: у каждого продукта в кабинете Сравни СВОЙ уникальный код виджета —
       разный набор атрибутов и разный aff_sub. Нельзя копировать атрибуты одного
       продукта на другой. Ниже — только те продукты, чей .rtf-код из папки
       ВИДЖЕТЫ уже сверен построчно с сайтом. У остальных enabled:false до сверки.
       Формат attrs: произвольные data-* атрибуты ровно как в присланном коде. */
    products: {
      osago: {
        enabled: true, status: "moderation", product: "osago", offer_id: "1064",
        /* сверено: ВИДЖЕТЫ/ОСАГО.rtf, 07.08.2026 */
        attrs: { "data-is-New-Wl": "true", "data-inFrame": "true", "data-layout": "full", "data-theme": "sravni_light", "data-aff_sub": "9" }
      },
      ns: {
        enabled: true, status: "moderation", product: "strahovanie-ns", offer_id: "1266",
        /* сверено: ВИДЖЕТЫ/Страхование от несчастного случая.rtf, 07.08.2026 */
        attrs: { "data-inFrame": "true", "data-theme-Palette": '{"elementsColor":"13, 209, 73","activeElementsColor":"13, 209, 73","backgroundColor":"0, 175, 255"}', "data-aff_sub": "19" }
      },
      strahovanie_ipoteki:  { enabled: false, status: "moderation", product: "strahovanie-ipoteki",       offer_id: "1072", attrs: {} }, // ⚠️ ждём .rtf из кабинета — код ещё не сверен
      strahovanie_kvartiry: { enabled: false, status: "moderation", product: "strahovanie-nedvizhimosti", offer_id: "1070", attrs: {} }, // ⚠️ ждём .rtf
      vzr:                  { enabled: false, status: "moderation", product: "strahovanie-vzr",           offer_id: "1068", attrs: {} }, // ⚠️ ждём .rtf
      kleshch:              { enabled: false, status: "moderation", product: "strahovanie-klesch",        offer_id: "2546", attrs: {} }, // ⚠️ ждём .rtf
      karty_kreditnye:      { enabled: false, status: "live",       product: "kredity/promo/karty",       offer_id: "1629", attrs: {} }, // ⚠️ ждём .rtf
      kredity:              { enabled: false, status: "moderation", product: "kredity",                   offer_id: "1580", attrs: {} }, // ⚠️ ждём .rtf
      zaimy:                { enabled: false, status: "moderation", product: "kredity",                   offer_id: "1580", attrs: {} }  // ⚠️ ждём .rtf
    }
  },

  /* --- Маркировка рекламы (erid выдаёт партнёрка Сравни на каждый CTA) ---
     Пусто => блок «Реклама…» не показывается (мы не печатаем несуществующий erid).
     advertiser/advertiserInn — рекламодатель, чей оффер крутим. */
  ads: {
    advertiser: "",                // ⚠️ ВСТАВИТЬ наименование рекламодателя из партнёрки Сравни
    advertiserInn: "",             // ⚠️ ВСТАВИТЬ ИНН рекламодателя из партнёрки
    erid: {                        // ⚠️ ВСТАВИТЬ erid по каждому продукту
      osago: "", kasko: "", strahovanie_ipoteki: "", strahovanie_kvartiry: "",
      ns: "", vzr: "", kleshch: "",
      kredity: "", zaimy: "", karty_kreditnye: "", karty_debetovye: "",
      vklady: "", ipoteka: ""
    }
  },

  /* --- РКН и хостинг (юр-статусы для внутреннего контроля) --- */
  rkn: {
    notificationSubmitted: false,  // ⚠️ true + дата/номер ПОСЛЕ подачи на pd.rkn.gov.ru
    notificationDate: "",          // ⚠️
    notificationNumber: ""         // ⚠️
  },

  /* --- Именованный эксперт (для /kak-eto-rabotaet и журнала) --- */
  expert: "",                      // ⚠️ ВСТАВИТЬ ФИО/должность эксперта

  /* --- Реестры ЦБ для строк доверия --- */
  registries: {
    insurers: "https://www.cbr.ru/insurance/registers/",
    banks: "https://www.cbr.ru/banking_sector/credit/",
    mfo: "https://www.cbr.ru/microfinance/registry/",
    nsis: "https://nsis.ru/"
  }
};
