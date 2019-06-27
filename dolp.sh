#! /etc/bash

# git clone https://github.com/Hiker9527/koa-react.git

# 安装所以的依赖
sudo npm install --registry=https://registry.npm.taobao.org
cd ./client && sudo npm install --registry=https://registry.npm.taobao.org

# 构建前端
echo "building font-end"
sudo npm run build

cd ../
if [ -d out ]
then
    rm -rf out
fi

mkdir -p out/release

cp . out/release