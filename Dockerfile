# ETAPA 1: Construcción (Build)
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Compilamos Angular a código estático
RUN npm run build --configuration=production

# ETAPA 2: Servidor Web (Nginx)
FROM nginx:alpine
# Copiamos tu configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 🚀 RUTA EXACTA según tu angular.json
COPY --from=build /app/dist/FenixTech-Admin/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]