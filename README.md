# Baby Shower de Gonzalo 🩵

Invitación web para el Baby Shower de Gonzalo — Next.js + Neon (Postgres),
lista para desplegar en Vercel.

## ¿Qué incluye?

- **`/`** — Página principal con la imagen, fecha (29 de agosto de 2026,
  3:00 PM), lugar (Quinta Alejandra, Pachuca de Soto), cuenta regresiva y
  botones para ver la ubicación y confirmar asistencia.
- **`/rsvp`** — El invitado busca y selecciona su nombre de la lista (no
  necesita crear cuenta ni escribir su nombre), y responde "Sí, ahí estaré"
  o "No podré asistir", con número de personas y teléfono. Puede volver a
  entrar después y cambiar su respuesta si algo cambia.
- **`/admin`** — Página protegida con contraseña donde solo tú (mamá) puedes:
  - Agregar los nombres de tus invitados (uno por línea) para que aparezcan
    en la lista de `/rsvp`.
  - Ver quién confirmó, quién no podrá asistir y quién sigue pendiente,
    con sus teléfonos y el total de personas confirmadas.
  - Eliminar a alguien de la lista si hace falta.

## 1. Crear la base de datos en Neon

1. Entra a [neon.tech](https://neon.tech) y crea un proyecto (plan gratuito).
2. En el dashboard, copia el **Connection string** (algo como
   `postgresql://usuario:password@ep-xxxx.neon.tech/neondb?sslmode=require`).
3. No necesitas crear la tabla a mano: la app la crea sola la primera vez
   que alguien confirma o que entras a `/admin`. Si prefieres crearla tú,
   usa el archivo `db/schema.sql` en el SQL Editor de Neon.

## 2. Configurar variables de entorno

Copia `.env.example` a `.env.local` para probar en tu computadora, o
configúralas directamente en Vercel (paso 3):

```
DATABASE_URL="postgresql://usuario:password@ep-xxxx.neon.tech/neondb?sslmode=require"
ADMIN_PASSWORD="elige-una-contraseña-solo-tú-la-sabrás"
ADMIN_SESSION_SECRET="opcional-otra-cadena-aleatoria-larga"
```

`ADMIN_PASSWORD` es la contraseña que usarás en `/admin` para ver las
confirmaciones. Elige algo que solo tú conozcas.

## 3. Desplegar en Vercel

1. Sube esta carpeta a un repositorio de GitHub (o usa `vercel` CLI
   directamente desde aquí).
2. En [vercel.com](https://vercel.com), haz clic en **Add New → Project** e
   importa el repositorio.
3. En **Environment Variables**, agrega `DATABASE_URL` y `ADMIN_PASSWORD`
   (y opcionalmente `ADMIN_SESSION_SECRET`) con los valores del paso 2.
4. Haz clic en **Deploy**. En unos minutos tendrás tu link, por ejemplo
   `https://baby-shower-gerardo.vercel.app`.

También puedes desplegar desde tu computadora con la CLI de Vercel:

```bash
npm i -g vercel
vercel        # sigue las instrucciones, y agrega las variables cuando te las pida
vercel --prod
```

## 4. Probar localmente (opcional)

```bash
npm install
cp .env.example .env.local   # y llena tus valores reales
npm run dev
```

Abre http://localhost:3000

## Actualización desde la versión anterior (importante)

Este repositorio ya estaba desplegado con el formulario libre (sin lista de
invitados) y tiene confirmaciones reales guardadas en la tabla `rsvps`. Al
desplegar esta nueva versión **no necesitas hacer nada manual**: la primera
vez que alguien visite el sitio (o entres a `/admin`), la app:

1. Crea la nueva tabla `invitados`.
2. Detecta que existe la tabla vieja `rsvps` y, si `invitados` está vacía,
   copia automáticamente esas confirmaciones como invitados con estado
   "confirmado" — no se pierde nada.

La tabla `rsvps` no se borra (por si quieres revisarla o respaldarla), sólo
deja de usarse. Después de desplegar, entra a `/admin` para confirmar que
tus invitados anteriores aparecen, y agrega ahí al resto de la lista antes
de compartir el link de `/rsvp`.

## Notas

- **Antes de compartir el link**, entra a `/admin` con tu contraseña y agrega
  los nombres de tus invitados (además de los que ya se migraron
  automáticamente). Así, cuando alguien entre a `/rsvp`, podrá buscar y
  seleccionar su nombre de la lista.
- La ubicación usa directamente el enlace de Google Maps que
  compartiste (Quinta Alejandra, Pachuca de Soto, Hgo.).
- La imagen del osito en globo (`public/oso.png`) ya tiene el fondo blanco
  removido para que se vea flotando de forma natural.
- Cada invitado puede volver a entrar a `/rsvp`, buscar su nombre otra vez y
  cambiar su respuesta (por ejemplo, si primero dijo que sí y luego ya no
  puede ir). La respuesta más reciente siempre sustituye a la anterior.
- Puedes cambiar el texto, colores o la fecha directamente en
  `app/page.tsx` y `components/Countdown.tsx`.
