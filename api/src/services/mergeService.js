/**
 * Item-Level Last-Write-Wins (LWW) Birleştirme Motoru
 * 
 * Kurallar:
 * 1. Mevcut ve gelen maddeler 'id' üzerinden eşleştirilir.
 * 2. Eşleşen maddelerde 'updated_at' değeri büyük (daha yeni) olan geçerli sayılır.
 * 3. Yerelde silinen maddeler 'is_deleted: true' bayrağı ve taze 'updated_at' ile aktarılır (Soft Delete).
 * 4. Listede olmayan yeni 'id'ler listeye eklenir.
 */
function mergeItemsLWW(existingItems = [], incomingItems = []) {
    const itemMap = new Map();

    // 1. Mevcut maddeleri haritaya yükle
    for (const item of existingItems) {
        if (item && item.id) {
            itemMap.set(item.id, { ...item });
        }
    }

    // 2. Gelen maddeleri LWW kuralıyla birleştir
    for (const incoming of incomingItems) {
        if (!incoming || !incoming.id) continue;

        if (!itemMap.has(incoming.id)) {
            // Yeni madde: Doğrudan ekle
            itemMap.set(incoming.id, {
                id: incoming.id,
                name: incoming.name || '',
                category: incoming.category || 'Genel',
                is_completed: Boolean(incoming.is_completed),
                updated_at: Number(incoming.updated_at) || Date.now(),
                is_deleted: Boolean(incoming.is_deleted)
            });
        } else {
            // Eşleşen madde: updated_at karşılaştırması
            const existing = itemMap.get(incoming.id);
            const existingTime = Number(existing.updated_at) || 0;
            const incomingTime = Number(incoming.updated_at) || 0;

            if (incomingTime >= existingTime) {
                itemMap.set(incoming.id, {
                    id: incoming.id,
                    name: incoming.name !== undefined ? incoming.name : existing.name,
                    category: incoming.category !== undefined ? incoming.category : existing.category,
                    is_completed: incoming.is_completed !== undefined ? Boolean(incoming.is_completed) : existing.is_completed,
                    updated_at: incomingTime,
                    is_deleted: incoming.is_deleted !== undefined ? Boolean(incoming.is_deleted) : existing.is_deleted
                });
            }
        }
    }

    return Array.from(itemMap.values());
}

module.exports = {
    mergeItemsLWW
};
