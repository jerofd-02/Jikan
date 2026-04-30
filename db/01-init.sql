-- ENTIDADES DE LA APLICACIÓN

CREATE TABLE users
(
    user_id  INTEGER AUTO_INCREMENT NOT NULL,
    name     VARCHAR(100) NOT NULL,
    mail     VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,

    CONSTRAINT pk_users PRIMARY KEY (user_id)
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
    user_id   INT,
    board_id  INT,

    CONSTRAINT pk_users_board PRIMARY KEY (user_id, board_id),

    CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_ub_board FOREIGN KEY (board_id) REFERENCES board (board_id) ON DELETE CASCADE
);

CREATE TABLE user_sessions
(
    user_id     INT     NOT NULL,
    session_id  INT     NOT NULL,
    created_at  TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_user_session PRIMARY KEY (session_id),
    CONSTRAINT fk_us_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE
);

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

CREATE TABLE user_task
(
    user_id   INT,
    task_id   INT,

    CONSTRAINT pk_user_task PRIMARY KEY (user_id, task_id),

    CONSTRAINT fk_ut_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE,
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