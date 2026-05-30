# Jikan
<p align="center">
    <img src="src/assets/Logo/Jikan_logo.png" style="width:300px;">
</p>

## Índice
- [Índice](#índice)
- [Introducción](#introducción)
- [Despliegue](#despliegue)
- [Despliegue con Electron](#despliegue-con-electron)
- [Sprint Zero](#sprint-zero)
- [Vista previa (Sprint Zero)](#vista-previa-del-sprint-zero)
- [Sprint 1](#sprint-1)
- [Sprint 2](#sprint-2)

## Introdución
Jikan, consiste en una aplicación web dedicada a la gestión y organización de tareas, así mismo y como diferencia del resto de aplicaciones del estilo, busca hacer sentir al usuario recompensado por completar sus tareas, mediante un sistema de gamificación. 

La inspiración inicial viene del método “Kanban” para gestionar proyectos y tareas de forma visual y cómoda, ofreciendo un sitio totalmente centralizado con todas las herramientas de productividad oportunas para organizar las diferentes tareas del usuario (tableros separados para diferentes contextos, calendario de tareas, alertas de tareas...).

## Despliegue
Para lanzar la aplicación es necesario contar con Docker, ya que la aplicación se despliega en contenedores para cada uno de sus componentes que se dividen en:
- **backend**: Contiene todos los endpoints y conexiones a la base de datos, para que los cambios sean persistentes.
- **frontend**: Contiene los ficheros que ve el usuario y permiten interactuar con la aplicación.
- **mysql/db**: Construye una base de datos MySQL y contiene todos los ficheros para que la base de datos genere las tablas y los datos iniciales.

Para realizar el despliegue se usa el siguiente comando:
```bash
docker compose up --build
```

Para acceder al despliegue de la aplicación se puede hacer desde esta dirección URL:
```bash
http://localhost:8080
```

Si por algún error necesitas resetear los contenedores, habría que usar el siguiente comando:
```bash
docker compose down -v
```

## Despliegue con Electron
Con Electron se siguen utilizando los contenedores de Docker de la misma forma y se puede usar de dos formas:

Primero nos vamos a la capreta frontend:
```bash
cd frontend
```

Como **primera opción** podemos ejecutar los siguientes comandos:
```bash
npm install
npm start
```
> [!NOTE]
> El comando npm install solo es necesario para instalar los paquetes y sus dependencias, si ya están instalados no hace falta volverlos a instalar

> [!NOTE]
> El comando npm start solo ejecuta la aplicación de Electron en modo dev y no instala la aplicación en el equipo

Como **segunda opción**, dentro de frontend también podemos ejecutar el siguiente comando, que es el que recomendamos:
```bash
npm run build
```
Este generará un ejecutable, que varía según en la plataforma en la que estés y que hay que instalar.

Alternativamente, también se puede forzar la generación del paquete apuntando a una plataforma en concreto:
```bash
npm run build --mac
```
Este comando generará un instalador o ejecutable para Mac.

## Sprint Zero
Para este sprint lo que se hizo fue lo siguiente:

Historias técnicas:
- **HT-01:** Desarrollar mockups.
- **HT-02:** Implementar mockups.

Historias de usuario:
- **HU-01:** Añadir tarea.
- **HU-02:** Eliminar tarea.
- **HU-03:** Cambiar estado de una tarea.
- **HU-04:** Modificar tarea.
- **HU-06:** Mover tarea.

## Vista previa del Sprint Zero
### index.html
![Página de inicio](/src/assets/Screenshots/Inicio.png)

### login.html
![Página de login](/src/assets/Screenshots/Login.png)

### register.html
![Página de registro](/src/assets/Screenshots/Register.png)

### user-profile.html
![Página del perfil del usuario](/src/assets/Screenshots/User_Profile.png)

## Sprint 1
Para este sprint lo que se hizo fue lo siguiente:

Historias técnicas:
- **HT-03:** Implementar diseño responsive.

Historias de usuario:
- **HU-05:** Crear tablero.
<p align="center">
    <img src="src/assets/Screenshots/Create_board_popup.png" style="width:300px;">
    <p align="center">Popup principal de creación del tablero.</p>
</p>
<p align="center">
    <img src="src/assets/Screenshots/Board_fast_creation.png" style="width:300px;">
    <p align="center">Creación rápida del tablero.</p>
</p>
<p align="center">
    <img src="src/assets/Screenshots/Custom_board_popup.png" style="width:300px;">
    <p align="center">Creación personalizada del tablero (pantalla 1).</p>
</p>
<p align="center">
    <img src="src/assets/Screenshots/Custom_board_popup_2.png" style="width:300px;">
    <p align="center">Creación personalizada del tablero (pantalla 2).</p>
</p>

- **HU-07:** Editar un tablero.
- **HU-08:** Eliminar un tablero.
<p align="center">
    <img src="src/assets/Screenshots/Delete_task_popup.png" style="width:300px;">
    <p align="center">Ejemplo de diálogo de eliminar.</p>
</p>

- **HU-09:** Crear una cuenta de usuario.
- **HU-10:** Iniciar sesión de cuenta de usuario.
- **HU-11:** Cerrar sesión de usuario.
- **HU-12:** Eliminar una cuenta de usuario.
- **HU-15:** Establecer una fecha a una tarea.
- **HU-16:** Establecer una fecha límite a una tarea.
- **HU-17:** Establecer recordatorios a una tarea.
<p align="center">
    <img src="src/assets/Screenshots/Set_reminder_popup.png" style="width:300px;">
    <p align="center">Creación del recordatorio de una tarea.</p>
</p>

- **HU-18:** Establecer categorías a una tarea.
- **HU-19:** Establecer temas de colores.
<p align="center">
    <img src="src/assets/Screenshots/Theme_selection.png" style="width:100%;">
    <p align="center">Selector de temas en el perfil de usuario.</p>
</p>

- **HU-20:** Colapsar el calendario.
- **HU-21:** Acciones de deshacer.
- **HU-22:** Establecer descripción a una tarea.
<p align="center">
    <img src="src/assets/Screenshots/Modify_task_popup.png" style="width:300px;">
    <p align="center">Nuevo diálogo de modificar tarea.</p>
</p>

## Sprint 2:
El sprint 2 consisitió en lo siguiente:

Historias técnicas:
- **HT-05:** Empaquetar la aplicación en Electron

Historias de usuario:
- **HU-13:** Compartir un tablero con otro usuario.
<p align="center">
    <img src="src/assets/Screenshots/Modify_task_popup.png" style="width:300px; display:inline-block; margin:10px;">
    <img src="src/assets/Screenshots/Share_Board_Confirmation.png" style="width:300px; display:inline-block; margin:10px;">
</p>
<p align="center">
    <em>Nuevo diálogo de modificar tarea.</em>
    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
    <em>Notificación para confirmar que el tablero se comparta.</em>
</p>

- **HU-14:** Asignar tarea a un usuario en un tablero compartido.
<p align="center">
    <img src="src/assets/Screenshots/Task_Assign_User.png" style="width:300px;">
    <p align="center">Popup de modificar tarea con usuarios asignados.</p>
</p>

- **HU-23:** Cambiar información de usuario.
- **HU-24:** Sistema de sugerencias.
- **HU-25:** Tableros gamificables.
<p align="center">
    <img src="src/assets/Screenshots/Jikan_Play.png" style="width:300px;">
    <p align="center">Ejemplo del tablero gamificable <em>Jikan Play</em>.</p>
</p>

- **HU-26:** Sistema de rachas y puntos.
- **HU-27:** Tienda de puntos.
<p align="center">
    <img src="src/assets/Screenshots/Items_Shop.png" style="width:300px;">
    <p align="center">Tienda de puntos del tablero gamificado.</p>
</p>

- **HU-28:** Obtener recompensas con puntos.
- **HU-29:** Tareas en el calendario.