@echo off
chcp 65001 > nul
echo =======================================================
echo 🚀 INICIANDO FENIXTECH FRONTEND (Angular + Nginx)
echo =======================================================
echo.

echo [1/3] 🧹 Deteniendo contenedores anteriores...
docker-compose down

echo.
echo [2/3] 🐳 Construyendo y levantando el contenedor...
docker-compose up -d --build

echo.
echo [3/3] ✅ ¡Todo listo! El panel esta corriendo en http://localhost:4200
echo Mostrando los logs en tiempo real (Presiona Ctrl+C para salir)...
echo -------------------------------------------------------
docker-compose logs -f admin-frontend