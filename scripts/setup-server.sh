#!/usr/bin/env bash
# ==============================================================================
# GCP Compute Engine VM İlk Kurulum Betiği (Ubuntu 22.04 / 24.04 LTS)
# ==============================================================================
# Bu betik VM üzerinde Docker, Docker Compose, Git kurar ve
# CI/CD için proje dizinini hazırlar.
# ==============================================================================

set -e

echo "=========================================="
echo "📦 1. Sistem Paketleri Güncelleniyor..."
echo "=========================================="
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release git ufw

echo "=========================================="
echo "🐳 2. Docker ve Docker Compose Kuruluyor..."
echo "=========================================="
# Eski Docker paketlerini kaldır
sudo apt-get remove -y docker docker-engine docker.io containerd runc || true

# Docker resmi GPG anahtarı ve repository ekleme
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg --yes

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Docker servisini başlat ve başlangıca ekle
sudo systemctl enable docker
sudo systemctl start docker

# Mevcut kullanıcıyı docker grubuna ekle (sudo olmadan docker komutlarını çalıştırabilmek için)
sudo usermod -aG docker "$USER"

echo "=========================================="
echo "📂 3. Uygulama Dizini Hazırlanıyor (/opt/app)..."
echo "=========================================="
sudo mkdir -p /opt/app
sudo chown -R "$USER":docker /opt/app
sudo chmod -R 775 /opt/app

echo "=========================================="
echo "🛡️  4. Güvenlik Duvarı (UFW) Ayarlanıyor..."
echo "=========================================="
# SSH, HTTP ve HTTPS portlarına izin ver
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
echo "y" | sudo ufw enable || true

echo "=========================================="
echo "✅ Kurulum Tamamlandı!"
echo "=========================================="
echo "Önemli Not:"
echo "1. 'docker' grubunun aktif olması için lütfen oturumunuzu kapatıp tekrar açın:"
echo "   exit"
echo "2. Ardından projenizi /opt/app dizinine klonlayın:"
echo "   git clone <REPO_URL> /opt/app"
echo "   cd /opt/app && cp .env.example .env"
echo "=========================================="
