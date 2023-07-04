# 使用 Node.js v20.3.1
FROM node:16

# 创建 app 目录
WORKDIR /usr/src/app

# 安装 app 依赖
# 使用通配符来确保 package.json 和 package-lock.json 都被复制
# 其中 package-lock.json 是可选的
COPY package*.json ./

RUN npm run build
# 如果你在生产环境中运行，你可以使用 `npm ci --only=production`

# 将你的 app 源代码复制到 Docker 容器中
COPY . .

# 暴露你的 app 所在的端口
EXPOSE 8080

# 定义 Docker 容器启动时运行的命令
CMD [ "npm", "run", "start" ]
