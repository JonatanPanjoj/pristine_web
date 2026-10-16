# Pristine Web Platform

**Pristine** es una plataforma web enterprise de gestión operativa y control de calidad enfocada en tres módulos clave:
1. **Administración**: Gestión de usuarios, roles de seguridad, permisos y control de versiones.
2. **Gestor de Técnicos & Infraestructura**: Catálogo de sedes, sectores, áreas técnicas, generación de códigos QR y reglas de configuración.
3. **Módulo de Checklist**: Dashboard analítico, programación de tareas de inspección, registro de revisiones, asignación de técnicos a categorías y generación de reportes ejecutivos (PDF/Excel).

---

## 🎨 Identidad Visual (Pristine - Baby Blue)
* **Paleta de Color**: Tonos *Baby Blue* (`#89CFF0`, `#389CD6`, `#1E3A5F`, `#F3F8FC`).
* **Diseño UI/UX**: Tarjetas flotantes (`rounded-[32px]`), sombras suaves (`shadow-[0_8px_30px_rgba(0,0,0,0.06)]`), microanimaciones con Framer Motion y tipografía *Inter*.
* **Identidad Gráfica**: Logotipo vectorial temporal en `/public/img/logo_largo.svg`.

---

## 🚀 Arquitectura y Conexión a MongoDB

El proyecto cuenta con una arquitectura desacoplada lista para operar tanto en entorno local como en servidor de producción (AWS):

```
┌─────────────────────────────────┐        HTTP / REST        ┌───────────────────────────────────┐
│  Pristine Frontend (React SPA)  │ ────────────────────────> │ Pristine Backend API (Express.js) │
│  http://localhost:3000          │  REACT_APP_API_URL        │ http://localhost:5000/api         │
└─────────────────────────────────┘                           └─────────────────┬─────────────────┘
                                                                                │ Mongoose
                                                                                ▼
                                                              ┌───────────────────────────────────┐
                                                              │       MongoDB (Local / AWS)       │
                                                              │       MONGODB_URI                 │
                                                              └───────────────────────────────────┘
```

### Variables de Entorno (`.env`)

```ini
# Configuración del Backend Server
PORT=5000

# Conexión MongoDB:
# 1. Modo Local:
MONGODB_URI=mongodb://localhost:27017/pristine

# 2. Modo AWS (Cambiar cuando esté en servidor de AWS):
# MONGODB_URI=mongodb://usuario:password@tu-servidor-mongo-aws:27017/pristine?authSource=admin

# Configuración del Frontend
# 1. Modo Local:
REACT_APP_API_URL=http://localhost:5000/api

# 2. Modo AWS:
# REACT_APP_API_URL=http://<IP-O-DOMINIO-AWS>:5000/api

# Clave AES para almacenamiento seguro en cliente
REACT_APP_KEYENCRIPT=PristineSecurityKey2026AES
```

---

## 🛠️ Instalación y Puesta en Marcha

### 1. Instalación de dependencias
```bash
npm install
```
*(O con Yarn: `yarn install`)*

### 2. Inicialización de la Base de Datos (Seed Inicial)
Asegúrate de tener MongoDB iniciado en tu máquina local (`mongod` o servicio MongoDB) y ejecuta:
```bash
npm run seed
```
Este comando creará automáticamente:
* La base de datos `pristine`.
* Todos los permisos del sistema.
* El rol `Super Administrador`.
* El usuario Administrador inicial:
  * **Usuario:** `admin`
  * **Contraseña:** `admin`
* Una sede, sector, área y categoría de prueba para navegar el sistema inmediatamente.

### 3. Ejecución del Proyecto

* **Ejecutar Backend y Frontend en paralelo:**
  ```bash
  npm run dev
  ```

* **O ejecutar por separado en terminales independientes:**
  * Terminal 1 (Servidor API MongoDB):
    ```bash
    npm run server
    ```
    *(Escucha en `http://localhost:5000/api`)*
  
  * Terminal 2 (Frontend React):
    ```bash
    npm start
    ```
    *(Disponible en `http://localhost:3000`)*

---

## ☁️ Despliegue en AWS

1. En el servidor donde resida MongoDB en AWS, asegúrate de configurar un usuario y contraseña y habilitar el puerto `27017` en el Security Group de AWS para la IP de tu servidor de aplicación.
2. En el archivo `.env` del servidor de aplicación, actualiza:
   ```ini
   MONGODB_URI=mongodb://usuario:password@<ip-servidor-mongo>:27017/pristine?authSource=admin
   REACT_APP_API_URL=http://<ip-servidor-backend>:5000/api
   ```
3. Construye el bundle de producción del cliente con `npm run build` y pon en marcha el servidor Node con `npm run server` (o administrado con `pm2`).
