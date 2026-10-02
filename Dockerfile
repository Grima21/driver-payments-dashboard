FROM node:20-alpine

WORKDIR /app

# 1. Copiar archivos de dependencias
COPY package*.json ./

# 2. Instalar todas las dependencias
RUN npm install

# 3. Copiar el código fuente
COPY . .

# 4. Compilar la aplicación de Next.js
RUN npm run build

EXPOSE 3000

# 5. Ejecutar en producción
CMD ["npm", "start"]