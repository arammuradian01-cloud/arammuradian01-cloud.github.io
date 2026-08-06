# Mixtell — публикация на GitHub Pages (без VPS)
Весь сайт статический. Заявки с форм уходят письмом на aram@mixtell.ru.

## Быстрый способ (в корне github.io)
1. Создайте на github.com пустой репозиторий  ВАШ-ЛОГИН.github.io  (без README).
2. Распакуйте архив, в папке выполните:
       git init && git add -A && git commit -m "Mixtell site"
       git branch -M main
       git remote add origin https://github.com/ВАШ-ЛОГИН/ВАШ-ЛОГИН.github.io.git
       git push -u origin main
3. Через 1–2 минуты: https://ВАШ-ЛОГИН.github.io/  — все ссылки, продукты,
   журнал, юрпакет и логотипы партнёров работают.

## На своём домене (demo.mixtell.ru), не трогая mixtell.ru
- Любое имя репозитория → Settings ▸ Pages ▸ ветка main / (root).
- Custom domain: demo.mixtell.ru; в DNS: CNAME demo → ВАШ-ЛОГИН.github.io

## Позже (с доменом/сервером)
- Виджеты «Сравни» рендерятся только на домене, привязанном к площадке 10645.
- CRM (реальный приём заявок) — backend, поднимается на VPS из папки crm/
  в архиве mixtell_site_full.zip; затем leadEndpoint в assets/config.js.
