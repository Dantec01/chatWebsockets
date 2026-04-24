# Real-Time Chat with Supabase & Next.js

Aplicación de chat en tiempo real construida con Next.js 16 (React 19), Tailwind CSS v4, componentes de interfaz de usuario de Radix UI (estilo Shadcn UI) y Supabase para el backend y manejo de WebSockets.

## 🚀 Características
- Mensajería en tiempo real usando Supabase Realtime.
- Lista de usuarios activos.
- Interfaz moderna (tema oscuro/claro).
- Construido con una arquitectura frontend rápida y escalable (Next.js App Router).

## 🛠 Requisitos Previos
Antes de iniciar, asegúrate de tener instalado:
- **Node.js**: (Recomendado v18 o superior)
- **pnpm**: Gestor de paquetes (`npm i -g pnpm`)
- Una cuenta en [Supabase](https://supabase.com/).

## 📦 Instalación

1. Clona el repositorio a tu máquina local.
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DEL_REPOSITORIO>
   ```

2. Instala las dependencias del proyecto usando `pnpm`:
   ```bash
   pnpm install
   ```

## ⚙️ Configuración de Variables de Entorno

Debes vincular el proyecto de frontend con tu instancia de Supabase. 

1. Ve a la consola de [Supabase](https://supabase.com/dashboard), crea un proyecto y ve a: `Project Settings` > `API`.
2. En la raíz del repositorio, crea un archivo `.env` o `.env.local`.
3. Configura las siguientes variables:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_base_aqui
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

*(Nota: Asegúrate de que tu `NEXT_PUBLIC_SUPABASE_URL` no termine en `/rest/v1/`, solo debes usar la URL raíz, por ejemplo: `https://abcdxyz.supabase.co`)*

## 🗄️ Configuración de la Base de Datos (Supabase SQL)

Dado que este proyecto usa **Supabase Realtime**, necesitas crear las tablas y habilitar las publicaciones correspondientes en tu base de datos mediante el editor SQL de Supabase.

Accede al **SQL Editor** en el panel de control de Supabase en la web y ejecuta los siguientes scripts en orden:

### 1. Crear las Tablas y Políticas de Seguridad (`scripts/001_create_tables.sql`)
Crea la tabla de `messages`, `active_users` y habilita el Row Level Security (RLS).

```sql
-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  content TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create active_users table
CREATE TABLE IF NOT EXISTS active_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_active_users_last_active ON active_users(last_active DESC);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE active_users ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations
CREATE POLICY "Allow all operations on messages" ON messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on active_users" ON active_users FOR ALL USING (true) WITH CHECK (true);
```

### 2. Habilitar el Tiempo Real (`scripts/002_enable_realtime.sql`)
Permite que los registros de estas tablas puedan ser escuchados mediante WebSockets.

```sql
-- Habilitar Realtime para las tablas
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE active_users;

-- Verificar que las tablas estén en la publicación
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

## ▶️ Ejecutar el Proyecto

Con las dependencias instaladas, las variables configuradas y la base de datos lista, ya puedes correr la aplicación.

Ejecuta en tu terminal el servidor de desarrollo:
```bash
pnpm dev
```

El servidor local de Next.js se iniciará. Abre tu navegador y accede a:
[http://localhost:3000](http://localhost:3000)

---
*Generado para simplificar la arquitectura e inicio rápido del chat WebSockets.*