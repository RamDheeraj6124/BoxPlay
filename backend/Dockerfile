FROM node:20

# set workdir
WORKDIR /app

# copy only package manifests and install deps
COPY package*.json ./
RUN npm install

# copy rest of your backend code
COPY . .

# expose port and start
EXPOSE 5000
CMD ["npm", "start"]