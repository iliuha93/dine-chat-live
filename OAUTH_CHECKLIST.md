# OAuth Setup Checklist

Чтобы кнопки Google и Facebook работали по-настоящему, нужно пройти три шага.
Supabase Project ID: `mcbcruwqdxtjcyyqovub`

---

## Шаг 1 — Google Cloud Console

1. Перейти на https://console.cloud.google.com
2. Выбрать проект (или создать новый)
3. APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID
4. Application type: **Web application**
5. Authorized redirect URIs добавить:
   ```
   https://mcbcruwqdxtjcyyqovub.supabase.co/auth/v1/callback
   ```
6. Сохранить → скопировать **Client ID** и **Client Secret**

---

## Шаг 2 — Facebook Developer

1. Перейти на https://developers.facebook.com
2. Создать приложение (тип: Consumer или Business)
3. Добавить продукт **Facebook Login → Web**
4. Facebook Login → Settings → Valid OAuth Redirect URIs:
   ```
   https://mcbcruwqdxtjcyyqovub.supabase.co/auth/v1/callback
   ```
5. Settings → Basic → скопировать **App ID** и **App Secret**

---

## Шаг 3 — Supabase Dashboard

1. Перейти на https://supabase.com/dashboard/project/mcbcruwqdxtjcyyqovub/auth/providers
2. **Google** → Enable → вставить Client ID и Client Secret из шага 1 → Save
3. **Facebook** → Enable → вставить App ID и App Secret из шага 2 → Save
4. Перейти на https://supabase.com/dashboard/project/mcbcruwqdxtjcyyqovub/auth/url-configuration
5. **Site URL** — указать основной домен приложения, например:
   ```
   https://your-app.up.railway.app
   ```
6. **Redirect URLs** — добавить:
   ```
   http://localhost:8080/auth/callback
   https://your-app.up.railway.app/auth/callback
   ```
7. Save

---

## Готово

После выполнения всех шагов кнопки "Войти через Google" и "Войти через Facebook"
на странице `/login` откроют настоящий OAuth-диалог и перенаправят пользователя
на `/auth/callback`, откуда он попадёт в `/chat`.

Кнопка "Продолжить как гость" работает без авторизации.
