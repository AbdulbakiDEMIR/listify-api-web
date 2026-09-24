#!/usr/bin/env bash
# ==============================================================================
# VM'e Yeni SSH Kullanıcısı Ekleme Betiği
# ==============================================================================
# Kullanım:
#   sudo ./scripts/add-ssh-user.sh <KULLANICI_ADI> "<PUBLIC_SSH_KEY>"
# Örnek:
#   sudo ./scripts/add-ssh-user.sh ahmet "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... ahmet@laptop"
# ==============================================================================

set -e

if [ "$#" -ne 2 ]; then
    echo "Kullanım: sudo $0 <kullanici_adi> \"<ssh_public_key>\""
    echo "Örnek: sudo $0 developer \"ssh-ed25519 AAAAC3NzaC... dev@company.com\""
    exit 1
fi

NEW_USER="$1"
SSH_PUB_KEY="$2"

if id "$NEW_USER" &>/dev/null; then
    echo "⚠️  Kullanıcı '$NEW_USER' zaten mevcut. SSH anahtarı güncelleniyor..."
else
    echo "👤 Yeni kullanıcı oluşturuluyor: $NEW_USER"
    sudo useradd -m -s /bin/bash "$NEW_USER"
fi

# Kullanıcıyı docker ve sudo gruplarına ekle
sudo usermod -aG sudo,docker "$NEW_USER"

# SSH dizini ve authorized_keys yapılandırması
USER_HOME=$(eval echo "~$NEW_USER")
SSH_DIR="$USER_HOME/.ssh"
AUTH_KEYS="$SSH_DIR/authorized_keys"

sudo mkdir -p "$SSH_DIR"
sudo chmod 700 "$SSH_DIR"

# Eğer anahtar henüz eklenmemişse ekle
if ! sudo grep -qF "$SSH_PUB_KEY" "$AUTH_KEYS" 2>/dev/null; then
    echo "$SSH_PUB_KEY" | sudo tee -a "$AUTH_KEYS" > /dev/null
    echo "🔑 SSH Public Key eklendi."
else
    echo "ℹ️  Bu SSH anahtarı zaten yetkilendirilmiş."
fi

sudo chmod 600 "$AUTH_KEYS"
sudo chown -R "$NEW_USER":"$NEW_USER" "$SSH_DIR"

# Proje dizinine erişim yetkisi ver (/opt/app)
if [ -d "/opt/app" ]; then
    sudo usermod -aG docker "$NEW_USER"
    echo "📁 /opt/app dizinine erişim sağlandı."
fi

echo "=========================================="
echo "✅ '$NEW_USER' kullanıcısı başarıyla oluşturuldu ve yapılandırıldı!"
echo "Bağlantı testi için yeni kullanıcı şunu çalıştırabilir:"
echo "   ssh $NEW_USER@<STATIK_IP>"
echo "=========================================="
