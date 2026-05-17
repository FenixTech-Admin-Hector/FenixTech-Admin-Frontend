# 🐦‍🔥 **FenixTech - Panel de Administración (Frontend)**

Este repositorio contiene el código fuente del Frontend para el Panel de Administración de FenixTech. Utilizamos una arquitectura moderna basada en Angular, Bootstrap 5 y SCSS para mantener un código limpio, reactivo, modular y totalmente tipado.

## 🚀 **Guía de Inicio Rápido**

Sigue estos pasos estrictamente para configurar tu entorno de desarrollo local. Actualmente, la ejecución se realiza de forma nativa sin Docker.

### **1. Prerrequisitos**

Asegúrate de tener instalados los siguientes programas en tu equipo:

Node.js (Versión LTS recomendada).

Angular CLI instalado globalmente. Si no lo tienes, abre una terminal y ejecuta:

Bash

npm install -g @angular/cli

### **2. Instalación de Dependencias**

El proyecto utiliza librerías externas (como el framework de Angular, Bootstrap e iconos) que no se suben al repositorio por peso. Para descargarlas, abre la terminal en la carpeta raíz del proyecto y ejecuta:

Bash

npm install

Esto creará la carpeta node\_modules basándose en las versiones exactas del archivo package.json.

### **3. Ejecución del Servidor de Desarrollo**

En Angular, no necesitamos compilar el SCSS a mano ni recargar el navegador. El CLI de Angular hace todo por nosotros con un servidor local que vigila los cambios.

Abre una terminal en la raíz del proyecto y ejecuta:

Bash

ng serve -o

Acceso: Abre tu navegador y ve a http://localhost:4200/

Nota Backend: Para que el panel muestre datos reales, asegúrate de tener el servidor Spring Boot (Backend) ejecutándose de forma simultánea y conectado a la base de datos MariaDB.

## 🏗️ **Arquitectura del Proyecto**

Este panel está construido utilizando el estándar moderno de Angular: Standalone Components. Esto significa que no dependemos de un archivo app.module.ts gigante, sino que cada vista es independiente.

### **Estructura de Carpetas Principal**

Plaintext

src/

├── app/

│   ├── components/      # Vistas modulares del panel (Dashboard, Usuarios, Productos...)

│   │   ├── users/

│   │   │   ├── users.ts      # Lógica TypeScript (Controlador)

│   │   │   ├── users.html    # Plantilla y estructura visual

│   │   │   └── users.scss    # SCSS encapsulado (solo afecta a este componente)

│   │   │

│   ├── services/        # Lógica de conexión con el Backend (Llamadas HTTP a Spring Boot)

│   │   ├── users.service.ts

│   │   └── ...

│   │

├── environments/        # Variables de entorno (URLs del backend para local/producción)

└── styles.scss          # ARCHIVO DE ESTILOS GLOBALES

## 🎨 **Arquitectura de Estilos (SCSS)**

En este proyecto aplicamos SCSS en dos niveles para evitar conflictos de diseño:

### **1. Nivel Global (src/styles.scss):**

Aquí se centralizan los estilos corporativos y se importa Bootstrap. El orden es crítico:

@import "variables"; → Primero cargamos nuestras configuraciones (colores corporativos, fuentes).

@import "bootstrap/scss/bootstrap"; → Luego cargamos Bootstrap (que usará nuestras variables).

Clases globales de utilidad (fondos, tipografías generales).

### **2. Nivel Local (\*.component.scss):**

Cada componente tiene su propio archivo SCSS. Cualquier estilo que escribas aquí solo afectará a ese componente. No te preocupes por pisar clases de otras vistas, Angular las encapsula automáticamente.
