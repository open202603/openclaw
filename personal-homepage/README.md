# Personal Homepage

一个围绕 **我的 AI 之路** 的个人主页静态站，目前也被用作一个可以接单的个人站初版。

## 文件

- `index.html`：主页结构
- `style.css`：页面样式
- `Caddyfile`：线上部署配置（HTTP / 80 端口）
- `DEPLOY-CADDY.md`：Caddy 部署说明

## 当前线上访问

当前线上通过 **Caddy + 80 端口** 提供访问：

```text
http://34.158.58.187/
```

## 本地预览

如果你只是本地临时预览，仍然可以在项目目录下运行：

```bash
python3 -m http.server 8080
```

然后打开：

```text
http://127.0.0.1:8080
```

## 线上部署目录

线上 Caddy 当前读取的目录是：

```text
/var/www/personal-homepage
```

如果你改了工作区源码，需要再同步到线上目录，例如：

```bash
sudo cp -r /home/zhoushuoji/.openclaw/workspace/personal-homepage/* /var/www/personal-homepage/
sudo chown -R caddy:caddy /var/www/personal-homepage
sudo chmod -R 755 /var/www/personal-homepage
sudo systemctl restart caddy
```

## 下一步建议

把下面这些占位内容替换成你的真实信息：

- 名字
- 简介
- 项目 / 服务
- 邮箱
- GitHub / 社交链接
- 联系方式
