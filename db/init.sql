-- ENTIDADES DE LA APLICACIÓN

CREATE TABLE users
(
    name     VARCHAR(100) NOT NULL,
    mail     VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,

    CONSTRAINT pk_users PRIMARY KEY (mail)
);


CREATE TABLE board
(
    board_id INT AUTO_INCREMENT NOT NULL,
    name     VARCHAR(100) NOT NULL,

    CONSTRAINT pk_board PRIMARY KEY (board_id)
);


CREATE TABLE columns_table
(
    column_id INT AUTO_INCREMENT NOT NULL,
    name      VARCHAR(100) NOT NULL,

    CONSTRAINT pk_column PRIMARY KEY (column_id)
);

-- RELACIONES ENTRE ENTIDADES DE LA APLICACIÓN

CREATE TABLE users_board
(
    user_mail VARCHAR(255),
    board_id  INT,

    CONSTRAINT pk_users_board PRIMARY KEY (user_mail, board_id),

    CONSTRAINT fk_ub_user FOREIGN KEY (user_mail) REFERENCES users (mail) ON DELETE CASCADE,
    CONSTRAINT fk_ub_board FOREIGN KEY (board_id) REFERENCES board (board_id) ON DELETE CASCADE
);

CREATE TABLE column_task
(
    id_column   INT          NOT NULL,

    id_task     INT AUTO_INCREMENT NOT NULL,
    name        VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    date        DATETIME,

    CONSTRAINT pk_task PRIMARY KEY (id_task),
    CONSTRAINT fk_ct_column FOREIGN KEY (id_column) REFERENCES columns_table (column_id) ON DELETE CASCADE
);

CREATE TABLE user_task
(
    user_mail VARCHAR(255),
    task_id   INT,

    CONSTRAINT pk_user_task PRIMARY KEY (user_mail, task_id),

    CONSTRAINT fk_ut_user FOREIGN KEY (user_mail) REFERENCES users (mail) ON DELETE CASCADE,
    CONSTRAINT fk_ut_task FOREIGN KEY (task_id) REFERENCES column_task (id_task) ON DELETE CASCADE
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

CREATE TABLE categories
(
    id_category INT AUTO_INCREMENT NOT NULL,
    id_board    INT          NOT NULL,
    name        VARCHAR(100) NOT NULL,

    CONSTRAINT pk_category PRIMARY KEY (id_category),
    CONSTRAINT fk_cat_board FOREIGN KEY (id_board) REFERENCES board (board_id) ON DELETE CASCADE,
    CONSTRAINT uq_category_per_board UNIQUE (id_board, name)
);

CREATE TABLE task_categories
(
    task_id     INT NOT NULL,
    id_category INT NOT NULL,

    CONSTRAINT pk_task_categories PRIMARY KEY (task_id, id_category),
    CONSTRAINT fk_tc_task FOREIGN KEY (task_id) REFERENCES column_task (id_task) ON DELETE CASCADE,
    CONSTRAINT fk_tc_category FOREIGN KEY (id_category) REFERENCES categories (id_category) ON DELETE CASCADE
);

ALTER TABLE column_task
    ADD COLUMN deadline DATETIME DEFAULT NULL;

-- Restricciones Semáticas Adicionales (RSA's)

-- RSA (user_board)
DELIMITER //

CREATE TRIGGER trigger_ub_before_delete
    BEFORE DELETE
    ON users_board
    FOR EACH ROW
BEGIN
    DECLARE total_users INT;

    SELECT COUNT(*)
    INTO total_users
    FROM users_board
    WHERE board_id = OLD.board_id;

    IF total_users <= 1 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Error: El tablero debe tener al menos un usuario.';
END IF;
END
//

DELIMITER ;

INSERT INTO board (name)
VALUES ('Proyecto Backend');

INSERT INTO columns_table (name)
VALUES ('To Do');
INSERT INTO columns_table (name)
VALUES ('In Progress');
INSERT INTO columns_table (name)
VALUES ('Done');

INSERT INTO board_column (id_board, id_column)
VALUES (1, 1);
INSERT INTO board_column (id_board, id_column)
VALUES (1, 2);
INSERT INTO board_column (id_board, id_column)
VALUES (1, 3);

-- Columna 1 (To Do)
INSERT INTO column_task (id_column, name, description, date)
VALUES (1, 'Diseñar API', 'Definir endpoints', NOW()),
       (1, 'Modelo BD', 'Diseñar tablas', NOW());

-- Columna 2 (In Progress)
INSERT INTO column_task (id_column, name, description, date)
VALUES (2, 'Implementar backend', 'Express + MySQL', NOW()),
       (2, 'Autenticación', 'Login y registro', NOW());

-- Columna 3 (Done)
INSERT INTO column_task (id_column, name, description, date)
VALUES (3, 'Setup proyecto', 'Inicialización repo', NOW()),
       (3, 'Docker listo', 'Contenedores funcionando', NOW());

INSERT INTO users (name, mail, password)
VALUES ('Juan', 'juan@mail.com', '1234');

INSERT INTO users_board (user_mail, board_id)
VALUES ('juan@mail.com', 1);

INSERT INTO categories (id_board, name)
VALUES (1, 'Frontend'),
       (1, 'Backend'),
       (1, 'Testing');