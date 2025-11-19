# Sistema de control de estado de vehículos

Trabajo Práctico Integrador – Técnicas Avanzadas de Programación

La idea del sistema es poder gestionar los turnos para revisiones de vehiculos y registrar el resultado de cada chequeo. Si el vehiculo tiene un puntaje seguro va a tener el estado "COMPLETADO", si no va a tener el resultado "RECHEQUEAR" y dar la opcion de sacar un nuevo turno. 
El proyecto se implemento con una arquitectura orientada a servicios, con el frontend, servicio de turnos y servicio de chequeos separados.

---

## Arquitectura general

La solución se compone de tres proyectos:

- `frontend/`: Aplicación React que usan los usuarios (dueño del vehículo e inspector).
- `backend/turnos/`: Microservicio para gestionar turnos y vehículos.
- `backend/chequeos/`: Microservicio para registrar chequeos y calcular el resultado.

Comunicación:

- El frontend se comunica con:
  - `turnos-service` en `http://localhost:3001`
  - `chequeos-service` en `http://localhost:3002`
- El servicio de chequeos se comunica con el servicio de turnos para:
  - Validar el turno a chequear
  - Actualizar el estado del turno a `COMPLETADO` o `RECHEQUEAR`

---

## Tecnologías utilizadas

- **Frontend**
  - React
  - Fetch API para consumo de servicios REST
  - CSS simple

- **Backend**
  - Node.js + Express
  - Arquitectura en capas (routes → controllers → services → data access)
  - Microservicios separados para `turnos` y `chequeos`
  - Comunicación entre servicios vía HTTP

- **Persistencia**
  - PostgreSQL
  - Prisma ORM (migraciones y acceso a datos)

- **Testing**
  - Jest
  - Supertest para pruebas de endpoints HTTP

- **Configuración**
  - Dotenv para variables de entorno
  - Scripts de npm para levantar servicios y ejecutar tests

---

## Instalación y configuración

### **Requisitos previos**

* Node.js (v18+)
* PostgreSQL instalado y corriendo en `localhost:5432`
* Tener disponible el comando `psql`

---

## Levantar el proyecto

Este proyecto incluye un script automático para levantar el proyecto.

### **1. Ejecutar el script de setup**

Desde la raíz del proyecto:

```bash
node setup.js
```

El script:

* Crea los usuarios y bases de datos necesarias en PostgreSQL
* Genera los `.env` para cada microservicio
* Instala dependencias de cada carpeta
* Ejecuta las migraciones de Prisma

> Ingresar usuario/contraseña de Postgres.

---

## Levantar todos los servicios con un solo comando

Una vez finalizado el setup ejecutar:

```bash
npm run dev
```

Esto levanta en **paralelo**:

| Servicio         | Carpeta            | Puerto                         |
| ---------------- | ------------------ | ------------------------------ |
| Backend Turnos   | `backend/turnos`   | **3001**                       |
| Backend Chequeos | `backend/chequeos` | **3002**                       |
| Frontend         | `frontend`         | **3000**                       |

La configuración está definida en el `package.json` raíz:

```json
"scripts": {
  "dev": "npm-run-all --parallel dev:turnos dev:chequeos dev:frontend",
  "dev:turnos": "cd backend/turnos && npm run dev",
  "dev:chequeos": "cd backend/chequeos && npm run dev",
  "dev:frontend": "cd frontend && npm start"
}
```

---

## Variables de entorno generadas automáticamente

### `backend/turnos/.env`

```env
DATABASE_URL="postgresql://tpi_user:CONTRASEÑA_GENERADA@localhost:5432/turnos_db?schema=public"
PORT=3001
```

### `backend/chequeos/.env`

```env
DATABASE_URL="postgresql://tpi_user:CONTRASEÑA_GENERADA@localhost:5432/chequeos_db?schema=public"
PORT=3002
```

> El `setup.js` los crea automáticamente.

---

## Modelado de dominio

### Servicio de Turnos

Entidades principales:

- **Vehiculo**
  - `id`
  - `patente`
  - `marca`
  - `modelo`
  - `anio`

- **Turno**
  - `id`
  - `vehiculoId`
  - `fechaHora`
  - `estado` (`PENDIENTE`, `CONFIRMADO`, `CANCELADO`, `COMPLETADO`, `RECHEQUEAR`)
  - `puntajeTotal` 

Reglas principales:

- No se pueden generar turnos en el pasado.
- Un vehículo no puede tener más de un turno pendiente.
- No se pueden superponer turnos en el mismo horario.
- El estado se actualiza según el flujo:
  - `PENDIENTE` → `CONFIRMADO` / `CANCELADO`
  - `CONFIRMADO` → `COMPLETADO` / `RECHEQUEAR`

### Servicio de Chequeos

Entidades principales:

- **Chequeo**
  - `id`
  - `appointmentId` 
  - `total` 
  - `resultado` (`SEGURO`, `RECHEQUEO`)
  - `observacion`

- **PuntoChequeo**
  - `id`
  - `stepId`
  - `puntaje`
  - `chequeoId`

- **Step**
  - `id`
  - `nombre` 

Reglas de negocio:

- Se evalúan 8 puntos con puntaje de 1 a 10.
- Si el total es mayor o igual a 80 ⇒ vehículo `SEGURO`.
- Si el total es menor a 40 ⇒ `RECHEQUEO`.
- Si algún punto tiene puntaje menor a 5 ⇒ `RECHEQUEO`.
- Cuando el resultado es `RECHEQUEO`, la observación es obligatoria.
- El servicio de chequeos valida que:
  - El turno exista en el servicio de turnos.
  - El turno esté en estado `CONFIRMADO`.
  - Luego actualiza el estado del turno (`COMPLETADO` o `RECHEQUEAR`).

---

## Roles y autorizaciones

El sistema contempla dos roles:

- **Dueño de vehículo (Cliente)**
  - Puede solicitar turno ingresando la patente.
  - No puede acceder a la gestión completa de turnos ni a los chequeos.

- **Inspector**
  - Puede listar, filtrar y gestionar turnos.
  - Puede confirmar y cancelar turnos.
  - Puede registrar chequeos y ver el resultado.

Implementación:

- En el **frontend**, el rol se simula con un selector de rol (Dueño de vehículo / Inspector).
- En el **backend**, los endpoints protegidos exigen el header HTTP:
  - `x-role: inspector`

Si el header no está presente o no es `inspector`, los servicios devuelven `403 Acceso solo para usuarios con rol inspector`.

---

## Endpoints principales

### Servicio de Turnos (`backend/turnos`)

Base URL: `http://localhost:3001/api/turnos`

- `POST /api/turnos`
  - Crea un turno a partir de:
    - `patente`, `fechaHora`, `marca`, `modelo`, `anio`
  - Validaciones:
    - No turnos con información faltante.
    - No turnos en fechas pasadas.
    - No dos turnos pendientes para el mismo vehículo.
    - No turnos superpuestos en el mismo horario.

- `GET /api/turnos` (requiere `x-role: inspector`)
  - Lista de turnos, con filtros opcionales:
    - `estado`
    - `patente`
    - `fecha`

- `POST /api/turnos/:id/confirmar` (requiere `x-role: inspector`)
- `POST /api/turnos/:id/cancelar` (requiere `x-role: inspector`)
- `POST /api/turnos/:id/completar` (requiere `x-role: inspector`)
  - Utilizado por el servicio de chequeos para actualizar el estado y guardar el puntaje total.

### Servicio de Chequeos (`backend/chequeos`)

Base URL: `http://localhost:3002/api/chequeos`

- `POST /api/chequeos` (requiere `x-role: inspector`)
  - Cuerpo:
    - `appointmentId`: ID del turno en el servicio de turnos
    - `puntos`: array de `{ stepId, puntaje }`
    - `observacion`
  - Validaciones:
    - El turno debe existir y estar `CONFIRMADO` en el servicio de turnos.
    - Cada puntaje debe estar entre 1 y 10.
    - Si el total es menor a 40 o algún puntaje es menor que 5, la observación es obligatoria.
  - Efectos:
    - Crea el chequeo y sus puntos.
    - Calcula total y resultado.
    - Actualiza el turno en el servicio de turnos.

---

## Instalación y configuración

### Requisitos previos

- Node.js (versión 18+ recomendada)
- PostgreSQL instalado y corriendo en `localhost:5432`

### Variables de entorno

Cada servicio tiene su propio `.env`:


## Testing

Cada microservicio tiene sus propios tests automatizados utilizando Jest y Supertest.

### Backend de Turnos

backend/turnos

```batch
npm test
```

### Backend de Chequeos

backend/chequeos

```batch
npm test
```
---

Los tests incluyen:

- Pruebas de endpoints HTTP
- Validaciones de reglas de negocio
- Comportamiento esperado frente a errores