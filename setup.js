// setup.js
const readline = require('readline');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question, defaultValue) {
  return new Promise((resolve) => {
    const q = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(q, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

function randomPassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pwd = '';
  for (let i = 0; i < length; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

function runCmd(cmd, options = {}) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...options });
}

async function main() {
  console.log('===============================================');
  console.log('  Setup automático TAdP TPI');
  console.log('===============================================\n');

  // 1) Pedir datos de Postgres
  const pgUser = await ask('Usuario administrador de Postgres', 'postgres');
  const pgPass = await ask('Password del usuario administrador (no se oculta, escribilo con cuidado)', '');
  const pgHost = await ask('Host de Postgres', 'localhost');
  const pgPort = await ask('Puerto de Postgres', '5432');

  const appUser = 'tpi_user';
  const appPass = randomPassword(); // contraseña random segura para la app

  const dbs = [
    {
      name: 'turnos_db',
      schema: 'public',
      envDir: path.join(__dirname, 'backend', 'turnos'),
      port: 3001,
    },
    {
      name: 'chequeos_db',
      schema: 'public',
      envDir: path.join(__dirname, 'backend', 'chequeos'),
      port: 3002,
    },
  ];

  function pgConn(database) {
    // OJO: no meter caracteres raros en el password del admin
    return `postgresql://${pgUser}:${pgPass}@${pgHost}:${pgPort}/${database}`;
  }

  function queryPsql(database, sql) {
    const conn = pgConn(database);
    const cmd = `psql "${conn}" -tAc "${sql.replace(/"/g, '\\"')}"`;
    try {
      const out = execSync(cmd, { stdio: 'pipe' }).toString().trim();
      return out;
    } catch (err) {
      console.error(`\n[ERROR] Al ejecutar query en Postgres (${database}):`);
      console.error(err.message || err);
      process.exit(1);
    }
  }

  function execPsql(database, sql) {
    const conn = pgConn(database);
    const cmd = `psql "${conn}" -v ON_ERROR_STOP=1 -c "${sql.replace(/"/g, '\\"')}"`;
    try {
      runCmd(cmd);
    } catch (err) {
      console.error(`\n[ERROR] Al ejecutar comando en Postgres (${database}):`);
      console.error(err.message || err);
      process.exit(1);
    }
  }

  // 2) Chequear que exista psql
  try {
    runCmd('psql --version');
  } catch (err) {
    console.error('\n❌ No se encontró el comando "psql".');
    console.error('Instalá PostgreSQL y asegurate de agregar "psql" al PATH.');
    process.exit(1);
  }

  console.log('\n▶ Configurando usuario de aplicación en Postgres...');

  // 3) Crear/actualizar rol tpi_user
  const roleExists = queryPsql('postgres', `SELECT 1 FROM pg_roles WHERE rolname='${appUser}'`);
    if (!roleExists) {
    console.log(`\n- Creando rol ${appUser} con permiso CREATEDB...`);
    execPsql(
        'postgres',
        `CREATE ROLE ${appUser} WITH LOGIN CREATEDB PASSWORD '${appPass}';`
    );
    } else {
    console.log(`\n- Rol ${appUser} ya existe, actualizando contraseña y otorgando CREATEDB...`);
    execPsql(
        'postgres',
        `ALTER ROLE ${appUser} WITH LOGIN CREATEDB PASSWORD '${appPass}';`
    );
    }

  // 4) Crear/ajustar bases de datos y permisos
  for (const db of dbs) {
    console.log(`\n▶ Configurando base de datos "${db.name}"...`);

    const exists = queryPsql(
      'postgres',
      `SELECT 1 FROM pg_database WHERE datname='${db.name}'`
    );

    if (!exists) {
      console.log(`- Creando base de datos ${db.name}...`);
      execPsql(
        'postgres',
        `CREATE DATABASE ${db.name} OWNER ${appUser};`
      );
    } else {
      console.log(`- La base ${db.name} ya existe, ajustando dueño...`);
      execPsql(
        'postgres',
        `ALTER DATABASE ${db.name} OWNER TO ${appUser};`
      );
    }

    console.log(`- Asignando permisos sobre schema ${db.schema}...`);
    execPsql(
      db.name,
      `GRANT ALL PRIVILEGES ON SCHEMA ${db.schema} TO ${appUser};`
    );
    execPsql(
      db.name,
      `ALTER SCHEMA ${db.schema} OWNER TO ${appUser};`
    );
  }

  console.log('\n✅ Usuario y bases de datos configuradas correctamente.');

  // 5) Generar .env para cada backend
  for (const db of dbs) {
    console.log(`\n▶ Generando .env para ${db.envDir}...`);

    if (!fs.existsSync(db.envDir)) {
      console.warn(`  ⚠ No existe el directorio ${db.envDir}, lo salto.`);
      continue;
    }

    const envPath = path.join(db.envDir, '.env');
    const dbUrl = `postgresql://${appUser}:${appPass}@${pgHost}:${pgPort}/${db.name}?schema=${db.schema}`;

    const envContent = [
      `DATABASE_URL="${dbUrl}"`,
      `PORT=${db.port}`,
      '',
    ].join('\n');

    fs.writeFileSync(envPath, envContent, 'utf8');

    console.log(`  - Archivo .env generado en: ${envPath}`);
    console.log(`  - DATABASE_URL: ${dbUrl}`);
  }

  // 6) Instalar dependencias y correr migraciones + seed en cada backend
  for (const db of dbs) {
    if (!fs.existsSync(db.envDir)) {
      continue;
    }

    console.log(`\n===============================================`);
    console.log(` Backend: ${db.envDir}`);
    console.log(`===============================================`);

    // npm install
    try {
      runCmd('npm install', { cwd: db.envDir });
    } catch (err) {
      console.error('\n❌ Error en npm install del backend, abortando.');
      process.exit(1);
    }

    // prisma migrate
    try {
      runCmd('npx prisma migrate dev --name init', { cwd: db.envDir });
    } catch (err) {
      console.error('\n❌ Error al ejecutar prisma migrate dev en backend, abortando.');
      process.exit(1);
    }

    // prisma seed (si está configurado)
    try {
      console.log('\n▶ Ejecutando seed (si está configurado)...');
      runCmd('npx prisma db seed', { cwd: db.envDir });
    } catch (err) {
      console.warn('\n⚠ No se pudo ejecutar npx prisma db seed (puede que no esté configurado). Sigo igual.');
    }
  }

  // 7) Instalar dependencias del frontend si existe
  const frontendDir = path.join(__dirname, 'frontend');
  if (fs.existsSync(frontendDir)) {
    console.log('\n===============================================');
    console.log(' Instalando dependencias del FRONTEND');
    console.log('===============================================');

    try {
      runCmd('npm install', { cwd: frontendDir });
    } catch (err) {
      console.warn('\n⚠ Error en npm install del frontend. El backend igual queda listo.');
    }
  } else {
    console.log('\n⚠ No se encontró carpeta "frontend", lo salto.');
  }

  console.log('\n🎉 Setup completado con éxito.');
  console.log('\nAhora podés levantar los servidores, por ejemplo:');
  console.log('  - Backend turnos:   cd backend/turnos   && npm start (o el script que tengas)');
  console.log('  - Backend chequeos: cd backend/chequeos && npm start');
  console.log('  - Frontend:         cd frontend         && npm start / npm run dev');
  rl.close();
}

main().catch((err) => {
  console.error('\n❌ Error inesperado en setup:');
  console.error(err);
  rl.close();
  process.exit(1);
});
