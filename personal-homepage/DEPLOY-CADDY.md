# Caddy deployment for IP-based access

## 1) Install Caddy

```bash
sudo apt update
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install -y caddy
```

## 2) Use the prepared Caddyfile

```bash
sudo cp /home/zhoushuoji/.openclaw/workspace/personal-homepage/Caddyfile /etc/caddy/Caddyfile
sudo caddy fmt --overwrite /etc/caddy/Caddyfile
sudo systemctl restart caddy
sudo systemctl status caddy --no-pager
```

## 3) Open port 80 if needed

If your cloud firewall/security group is closed, allow inbound TCP/80.

## 4) Visit

```text
http://34.158.58.187
```

## Note

IP-based access is configured as HTTP only. Automatic HTTPS is typically for real domains, not bare IPs.
