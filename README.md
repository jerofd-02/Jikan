# Jikan
<p align="center">
    <img src="src/assets/Logo/Jikan_logo.png" style="width:300px;">
</p>

## Índice
- [Índice](#índice)
- [Introducción](#introducción)
- [Despliegue](#despliegue)
- [Sprint Zero](#sprint-zero)
- [Vista previa](#vista-previa)

## Introdución
Jikan, consiste en una aplicación web dedicada a la gestión y organización de tareas, así mismo y como diferencia del resto de aplicaciones del estilo, busca hacer sentir al usuario recompensado por completar sus tareas, mediante un sistema de gamificación. 

La inspiración inicial viene del método “Kanban” para gestionar proyectos y tareas de forma visual y cómoda, ofreciendo un sitio totalmente centralizado con todas las herramientas de productividad oportunas para organizar las diferentes tareas del usuario (tableros separados para diferentes contextos, calendario de tareas, alertas de tareas…).

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

## Sprint Zero
Para este sprint lo que se hizo fue lo siguiente:
- Diseñar mockups con la estructura y principales páginas de la aplicación mediante Figma.
- Desarrollar un frontend de la aplicación y centrarnos en el sistema de gestión de tareas simples (CRUD), mediante HTML y CSS.
- Elaborar el backend suficiente para el funcionamiento de la aplicación orientado a las tareas más simples y esenciales de un usuario simple. Logrando así la persistencia de tareas con una estructura básica de datos.

## Vista previa
### index.html
![Página de inicio](/src/assets/Screenshots/Inicio.png)

### login.html
![Página de login](/src/assets/Screenshots/Login.png)

### register.html
![Página de registro](/src/assets/Screenshots/Register.png)

### user-profile.html
![Página del perfil del usuario](/src/assets/Screenshots/User%20Profile.png)