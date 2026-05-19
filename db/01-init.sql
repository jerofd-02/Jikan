-- ENTIDADES DE LA APLICACIÓN
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;


CREATE TABLE users
(
    id       INT          NOT NULL AUTO_INCREMENT,
    name     VARCHAR(100) NOT NULL,
    mail     VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    jikoins INT NOT NULL DEFAULT 1000,
    multiplier INT default null,
    boosted_until TIMESTAMP default null,
    protect_until TIMESTAMP default null,
    

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT min_jikoins CHECK (jikoins >= 0)
);


CREATE TABLE board
(
    board_id INT AUTO_INCREMENT NOT NULL,
    name     VARCHAR(100) NOT NULL,

    CONSTRAINT pk_board PRIMARY KEY (board_id)
);

-- Entidad que hereda de la tabla "board"

CREATE TABLE gamified_board
(
    id_board INT NOT NULL,

    daily_tasks INT NOT NULL DEFAULT 4,
    current_streak INT NOT NULL DEFAULT 0,
    best_streak INT NOT NULL DEFAULT 0,

    CONSTRAINT pk_gamified_board PRIMARY KEY (id_board),
    CONSTRAINT fk_gamifiedboard_board FOREIGN KEY (id_board) REFERENCES board (board_id) ON DELETE CASCADE,

    CONSTRAINT max_tasks CHECK (daily_tasks BETWEEN 4 AND 6),
    CONSTRAINT streak CHECK (current_streak <= best_streak)
);


CREATE TABLE columns_table
(
    column_id INT AUTO_INCREMENT NOT NULL,
    name      VARCHAR(100) NOT NULL,

    CONSTRAINT pk_column PRIMARY KEY (column_id)
);

CREATE TABLE objects
(
    object_id INT AUTO_INCREMENT NOT NULL,
    object_name VARCHAR(255) NOT NULL,
    object_description VARCHAR(255) NOT NULL,
    object_img VARCHAR(255) NOT NULL,

    object_price INT NOT NULL,

    object_category VARCHAR(255) NOT NULL,
    object_label VARCHAR(255),
    one_time BOOLEAN NOT NULL,

    CONSTRAINT pk_object PRIMARY KEY (object_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RELACIONES ENTRE ENTIDADES DE LA APLICACIÓN

CREATE TABLE users_board
(
    user_id   INT,
    board_id  INT,

    CONSTRAINT pk_users_board PRIMARY KEY (user_id, board_id),

    CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_ub_board FOREIGN KEY (board_id) REFERENCES board (board_id) ON DELETE CASCADE
);

CREATE TABLE user_sessions
(
    user_id     INT     NOT NULL,
    session_id  VARCHAR(255)     NOT NULL,
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_user_session PRIMARY KEY (session_id),
    CONSTRAINT fk_us_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- En esta relación vive la entidad "task"
CREATE TABLE column_task
(
    id_column   INT          NOT NULL,

    id_task     INT AUTO_INCREMENT NOT NULL,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    date        DATETIME,
    deadline    DATETIME,

    CONSTRAINT pk_task PRIMARY KEY (id_task),
    CONSTRAINT fk_ct_column FOREIGN KEY (id_column) REFERENCES columns_table (column_id) ON DELETE CASCADE
);

CREATE TABLE tasks_logs
(
    board_id INT NOT NULL,
    task_id INT NOT NULL,

    log_date DATE NOT NULL DEFAULT (CURRENT_DATE),
    completed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_tasks_logs PRIMARY KEY (board_id, task_id, log_date),

    CONSTRAINT fk_taskslogs_board FOREIGN KEY (board_id) REFERENCES gamified_board (id_board) ON DELETE CASCADE,
    CONSTRAINT fk_taskslogs_tasks FOREIGN KEY (task_id) REFERENCES column_task (id_task) ON DELETE CASCADE
);

CREATE TABLE user_task
(
    user_id   INT,
    task_id   INT,

    CONSTRAINT pk_user_task PRIMARY KEY (user_id, task_id),

    CONSTRAINT fk_ut_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_ut_task FOREIGN KEY (task_id) REFERENCES column_task (id_task) ON DELETE CASCADE
);

CREATE TABLE purchases
(
    purchase_id INT AUTO_INCREMENT NOT NULL,
    id_user INT NOT NULL,
    id_object INT NOT NULL,
    bought_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP DEFAULT NULL,
    price_paid INT NOT NULL,

    CONSTRAINT pk_user_object PRIMARY KEY (purchase_id),

    CONSTRAINT fk_uo_user FOREIGN KEY (id_user) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_uo_object FOREIGN KEY (id_object) REFERENCES objects (object_id) ON DELETE CASCADE
);

-- propiedad multivaluada de "task"

CREATE TABLE task_labels
(
    id_task_label INT AUTO_INCREMENT NOT NULL,
    label         VARCHAR(100) NOT NULL,
    task_id       INT          NOT NULL,

    CONSTRAINT pk_task_label PRIMARY KEY (id_task_label),
    CONSTRAINT fk_tl_task FOREIGN KEY (task_id) REFERENCES column_task (id_task) ON DELETE CASCADE
);


CREATE TABLE board_column
(
    id_board  INT NOT NULL,
    id_column INT NOT NULL,

    CONSTRAINT pk_board_column PRIMARY KEY (id_board, id_column),

    CONSTRAINT fk_bc_board FOREIGN KEY (id_board) REFERENCES board (board_id) ON DELETE CASCADE,
    CONSTRAINT fk_bc_column FOREIGN KEY (id_column) REFERENCES columns_table (column_id) ON DELETE CASCADE
);


INSERT INTO objects (object_id, object_name, object_description, object_img, object_price, object_category, object_label, one_time) VALUES 
(1, "Azul", "Cambia el tema de la aplicación a azul", "🟦", 50, "Tema", null, true),
(2, "Amarillo", "Cambia el tema de la aplicación a amarillo", "🟨", 50, "Tema", null, true),
(3, "Verde", "Cambia el tema de la aplicación a verde", "🟩", 50, "Tema", null, true),
(4, "Marrón", "Cambia el tema de la aplicación a marrón", "🟫", 50, "Tema", "Nuevo", true),
(5, "x2", "Potencia la racha x2 durante 24 horas", "🔥", 100, "Potenciador", null, false),
(6, "x5", "Potencia la racha x5 durante 24 horas", "🔥", 200, "Potenciador", null, false),
(7, "x10", "Potencia la racha x10 durante 24 horas", "🔥", 500, "Potenciador", null, false),
(8, "1 dia", "Proteje la racha durante 1 día", "🛡️", 100, "Protector", "Oferta", false),
(9, "2 dias", "Proteje la racha durante 2 días", "🛡️", 200, "Protector", null, false);