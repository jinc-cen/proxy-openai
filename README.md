# OpenAI API 代理

这是一个简单的 Node.js 代理服务器，用于将请求转发到 OpenAI API。服务器只接受以路径 `/v1/` 开始的 POST 请求。

## 先决条件

- [Node.js](https://nodejs.org/zh-cn/) v14.0.0 或以上版本

## 安装

克隆仓库到你的本地机器：

```bash
git clone https://github.com/你的用户名/你的仓库名.git
cd 你的仓库名
```

然后使用以下命令安装项目依赖：

```bash
npm install
```

## 本地运行

启动服务器：

```bash
npm start
```

现在，服务器在 http://localhost:3000 运行。

## 部署到 Railway

1. 安装 Railway CLI：

   ```bash
   npm install -g railway
   ```

2. 登录 Railway：

   ```bash
   railway login
   ```

3. 初始化一个新的 Railway 项目：

   ```bash
   railway init
   ```

4. 部署项目：

   ```bash
   railway up
   ```

一旦部署完成，Railway 将提供一个到在线应用的 URL。

请注意：这是一个基本的实现。你可能需要根据你的需求调整这个实现，特别是在生产环境中。
