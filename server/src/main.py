from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.core.database import verify_connection
from src.apis.auth import router as auth_router
from src.apis.categorias import router as categorias_router
from src.apis.productos import router as productos_router
from src.apis.clientes import router as clientes_router
from src.apis.pedidos import router as pedidos_router
from src.apis.inventario import router as inventario_router
from src.apis.comprobantes import router as comprobantes_router
from src.apis.usuarios import router as usuarios_router
@asynccontextmanager
async def lifespan(app: FastAPI):
    ok = await verify_connection()
    if ok:
        print("Conexión a la base de datos exitosa")
    else:
        print("ERROR: No se pudo conectar a la base de datos")
    yield


app = FastAPI(title="La Comarca API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(categorias_router)
app.include_router(productos_router)
app.include_router(clientes_router)
app.include_router(pedidos_router)
app.include_router(inventario_router)
app.include_router(comprobantes_router)
app.include_router(usuarios_router)

