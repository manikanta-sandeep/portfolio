#!/usr/bin/env bash
# One-time setup for an Oracle Cloud Always Free VM running Ubuntu (22.04 or 24.04).
# Installs nginx and Node.js, opens ports 80/443, sets up the API service, its database
# directory and daily backups, installs the site config, and gets a Let's Encrypt
# certificate. Run on the VM from the repo's deploy/ folder:
#
#   sudo bash setup-server.sh you@example.com
#
# Run it only after sandeeppuppala.com and www.sandeeppuppala.com resolve to this VM's
# public IP, or the certificate step fails (re-run the script once DNS has propagated).
set -euo pipefail

DOMAIN="sandeeppuppala.com"
EMAIL="${1:?Usage: sudo bash setup-server.sh <email for certificate expiry notices>}"
DEPLOY_USER="${SUDO_USER:-ubuntu}"
WEB_ROOT="/var/www/${DOMAIN}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

apt-get update
apt-get install -y ca-certificates curl gnupg nginx certbot python3-certbot-nginx rsync iptables-persistent   sqlite3 build-essential python3

# Node.js 22 LTS from NodeSource (Ubuntu's own package is too old for the API).
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 20 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi

# Oracle's Ubuntu images ship iptables rules that reject everything except SSH, even after
# the VCN security list allows 80/443. Insert ACCEPT rules ahead of the REJECT rule.
for port in 80 443; do
  if ! iptables -C INPUT -p tcp -m state --state NEW --dport "$port" -j ACCEPT 2>/dev/null; then
    reject_line="$(iptables -L INPUT --line-numbers -n | awk '$2 == "REJECT" { print $1; exit }')"
    if [ -n "$reject_line" ]; then
      iptables -I INPUT "$reject_line" -p tcp -m state --state NEW --dport "$port" -j ACCEPT
    else
      iptables -A INPUT -p tcp -m state --state NEW --dport "$port" -j ACCEPT
    fi
  fi
done
netfilter-persistent save

# The deploy user owns the web root so GitHub Actions can rsync without sudo.
mkdir -p "$WEB_ROOT"
chown -R "$DEPLOY_USER":"$DEPLOY_USER" "$WEB_ROOT"
if [ ! -f "$WEB_ROOT/index.html" ]; then
  echo "<!doctype html><title>${DOMAIN}</title><p>Deploy pending.</p>" > "$WEB_ROOT/index.html"
  chown "$DEPLOY_USER":"$DEPLOY_USER" "$WEB_ROOT/index.html"
fi

# API: code in /opt/portfolio (written by the deploy user), database and uploads in
# /var/lib/portfolio (writable only by the service's own "portfolio" user).
id portfolio >/dev/null 2>&1 || useradd --system --home-dir /var/lib/portfolio --shell /usr/sbin/nologin portfolio
mkdir -p /opt/portfolio /var/lib/portfolio
chown -R "$DEPLOY_USER":"$DEPLOY_USER" /opt/portfolio
chown -R portfolio:portfolio /var/lib/portfolio
chmod 750 /var/lib/portfolio
install -m 644 "$SCRIPT_DIR/portfolio-api.service" /etc/systemd/system/portfolio-api.service
systemctl daemon-reload
# Started by the first deploy, once the code is in /opt/portfolio.
systemctl enable portfolio-api
install -m 755 "$SCRIPT_DIR/portfolio-backup" /etc/cron.daily/portfolio-backup

install -m 644 "$SCRIPT_DIR/nginx/sandeeppuppala-security.conf" /etc/nginx/snippets/sandeeppuppala-security.conf
install -m 644 "$SCRIPT_DIR/nginx/sandeeppuppala-files.conf" /etc/nginx/snippets/sandeeppuppala-files.conf
install -m 644 "$SCRIPT_DIR/nginx/${DOMAIN}.conf" "/etc/nginx/sites-available/${DOMAIN}.conf"
ln -sf "/etc/nginx/sites-available/${DOMAIN}.conf" "/etc/nginx/sites-enabled/${DOMAIN}.conf"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl enable --now nginx
systemctl reload nginx

# Adds the 443 server blocks and an HTTP -> HTTPS redirect; renewal runs via a systemd timer.
certbot --nginx --non-interactive --agree-tos --redirect -m "$EMAIL" -d "$DOMAIN" -d "www.${DOMAIN}"

echo "Done. https://${DOMAIN} is served from ${WEB_ROOT} (owned by ${DEPLOY_USER})."
echo "After the first deploy, create your admin login with:"
echo "  sudo -u portfolio env DATA_DIR=/var/lib/portfolio node /opt/portfolio/server/src/cli/create-admin.js <username>"
