FROM node:16

# set workdir
WORKDIR /app

# copy only package manifests and install deps
COPY package*.json ./
RUN npm install

# copy rest of your React app
COPY . .

# expose port and start
EXPOSE 3000
CMD ["npm", "start"]