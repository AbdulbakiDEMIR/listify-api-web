/**
 * Item-Level Last-Write-Wins (LWW) Birleştirme Motoru
 * 
 * Kurallar:
 * 1. Mevcut ve gelen maddeler 'id' üzerinden eşleştirilir.
 * 2. Eşleşen maddelerde 'updated_at' değeri büyük (daha yeni) olan geçerli sayılır.
 * 3. Gelecek tarihli zaman damgası manipülasyonuna karşı 'updated_at' değeri (şimdi + 5 dakika) ile sınırlandırılır.
 * 4. Madde sırası ('order') mutlaka saklanır ve yanıtlarla döndürülür.
 * 5. Yerelde silinen maddeler 'is_deleted: true' bayrağı ve taze 'updated_at' ile aktarılır (Soft Delete).
 * 6. Listede olmayan yeni 'id'ler listeye eklenir.
 */
function mergeItemsLWW(existingItems = [], incomingItems = []) {
    const itemMap = new Map();
    const MAX_FUTURE_OFFSET_MS = 5 * 60 * 1000; // 5 dakika sınırı
    const maxAllowedTime = Date.now() + MAX_FUTURE_OFFSET_MS;

    // 1. Mevcut maddeleri haritaya yükle
    for (const item of existingItems) {
        if (item && item.id) {
            itemMap.set(item.id, {
                id: item.id,
                name: item.name || '',
                category: item.category || 'Genel',
                is_completed: Boolean(item.is_completed),
                updated_at: Number(item.updated_at) || Date.now(),
                is_deleted: Boolean(item.is_deleted),
                order: item.order !== undefined && item.order !== null ? Number(item.order) : 0
            });
        }
    }

    // 2. Gelen maddeleri LWW kuralıyla birleştir
    for (const incoming of incomingItems) {
        if (!incoming || !incoming.id) continue;

        // Gelecek tarihli zaman damgası sınırı (Now + 5 min clamping)
        const rawTime = Number(incoming.updated_at) || Date.now();
        const incomingTime = Math.min(rawTime, maxAllowedTime);

        const incomingOrder = incoming.order !== undefined && incoming.order !== null ? Number(incoming.order) : null;

        if (!itemMap.has(incoming.id)) {
            // Yeni madde: Doğrudan ekle
            itemMap.set(incoming.id, {
                id: incoming.id,
                name: incoming.name || '',
                category: incoming.category || 'Genel',
                is_completed: Boolean(incoming.is_completed),
                updated_at: incomingTime,
                is_deleted: Boolean(incoming.is_deleted),
                order: incomingOrder !== null ? incomingOrder : itemMap.size
            });
        } else {
            // Eşleşen madde: updated_at karşılaştırması
            const existing = itemMap.get(incoming.id);
            const existingTime = Number(existing.updated_at) || 0;

            if (incomingTime >= existingTime) {
                itemMap.set(incoming.id, {
                    id: incoming.id,
                    name: incoming.name !== undefined ? incoming.name : existing.name,
                    category: incoming.category !== undefined ? incoming.category : existing.category,
                    is_completed: incoming.is_completed !== undefined ? Boolean(incoming.is_completed) : existing.is_completed,
                    updated_at: incomingTime,
                    is_deleted: incoming.is_deleted !== undefined ? Boolean(incoming.is_deleted) : existing.is_deleted,
                    order: incomingOrder !== null ? incomingOrder : (existing.order !== undefined ? existing.order : 0)
                });
            }
        }
    }

    return Array.from(itemMap.values());
}

module.exports = {
    mergeItemsLWW
};

