import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import declarative_base, sessionmaker


load_dotenv() #carga variables del archivo .env 
# configura conexion  a PostgreSQL
DATABASE_URL = URL.create(
    drivername="postgresql+psycopg",
    username=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT", "5432")),
    database=os.getenv("DB_NAME"),
)

engine = create_engine(DATABASE_URL) #crea el motor de conexion de SQLAlchemy que sabe como conectarse con PostgreSQL

SessionLocal = sessionmaker( # Preparar sesiones de base de datos
    bind=engine,
    autoflush=False,
    autocommit=False,

)

# Clase base para nuestros modelos de SQLAlchemy
Base = declarative_base()


# Proporciona una sesión de DB a cada request y la cierra al terminar
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()