FROM node:14

# Create app directory
WORKDIR /usr/src/app/wst.news

# copy source files
COPY package*.json ./

# install dependencies
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# start
EXPOSE 3000
CMD ["npm", "run", "dev"]
