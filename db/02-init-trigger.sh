#!/bin/bash

mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" <<EOF

DELIMITER //

CREATE TRIGGER trigger_ub_before_delete
BEFORE DELETE ON users_board
FOR EACH ROW
BEGIN
    DECLARE total_users INT;

    IF @disable_trigger IS NULL OR @disable_trigger = 0 THEN
        SELECT COUNT(*) INTO total_users
        FROM users_board
        WHERE board_id = OLD.board_id;

        IF total_users <= 1 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Error: El tablero debe tener al menos un usuario.';
        END IF;
    END IF;
END //

DELIMITER ;

EOF