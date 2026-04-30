import os
from contextlib import contextmanager

import mysql.connector
from dotenv import load_dotenv

load_dotenv()

_config = {
    "host":     os.getenv("DB_HOST", "db.app.getvaas.com"),
    "port":     int(os.getenv("DB_PORT", 3306)),
    "database": os.getenv("DB_NAME", "payments_db"),
    "user":     os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD"),
    "ssl_disabled": os.getenv("DB_SSL", "false").lower() != "true",
    "ssl_verify_cert": False,
    "auth_plugin": "mysql_native_password",
    "use_pure": True,
}


def get_connection() -> mysql.connector.MySQLConnection:
    return mysql.connector.connect(**_config)


@contextmanager
def cursor(dictionary: bool = True):
    conn = get_connection()
    cur = conn.cursor(dictionary=dictionary)
    try:
        yield cur
        conn.commit()
    finally:
        cur.close()
        conn.close()


def query(sql: str, params=None) -> list[dict]:
    with cursor() as cur:
        cur.execute(sql, params or ())
        return cur.fetchall()


if __name__ == "__main__":
    rows = query("SELECT 1 AS ok")
    print("Conexión exitosa:", rows)
