// Türkçe ve İngilizce Akıllı Ürün-Kategori Sözlüğü

export const CATEGORIES = [
  'Meyve & Sebze',
  'Süt & Kahvaltılık',
  'Fırın & Unlu Mamüller',
  'Et, Tavuk & Balık',
  'Temizlik & Hijyen',
  'Atıştırmalık & İçecek',
  'Kuru Gıda & Bakliyat',
  'Kişisel Bakım',
  'Diğer'
] as const;

export type CategoryName = typeof CATEGORIES[number];

const DICTIONARY: Record<string, CategoryName> = {
  // Meyve & Sebze
  'elma': 'Meyve & Sebze',
  'armut': 'Meyve & Sebze',
  'muz': 'Meyve & Sebze',
  'domates': 'Meyve & Sebze',
  'salatalık': 'Meyve & Sebze',
  'patates': 'Meyve & Sebze',
  'soğan': 'Meyve & Sebze',
  'biber': 'Meyve & Sebze',
  'havuç': 'Meyve & Sebze',
  'limon': 'Meyve & Sebze',
  'portakal': 'Meyve & Sebze',
  'marul': 'Meyve & Sebze',
  'maydanoz': 'Meyve & Sebze',
  'ıspanak': 'Meyve & Sebze',
  'çilek': 'Meyve & Sebze',
  'apple': 'Meyve & Sebze',
  'banana': 'Meyve & Sebze',
  'tomato': 'Meyve & Sebze',
  'potato': 'Meyve & Sebze',
  'onion': 'Meyve & Sebze',

  // Süt & Kahvaltılık
  'süt': 'Süt & Kahvaltılık',
  'peynir': 'Süt & Kahvaltılık',
  'kaşar': 'Süt & Kahvaltılık',
  'yoğurt': 'Süt & Kahvaltılık',
  'yumurta': 'Süt & Kahvaltılık',
  'zeytin': 'Süt & Kahvaltılık',
  'tereyağı': 'Süt & Kahvaltılık',
  'bal': 'Süt & Kahvaltılık',
  'reçel': 'Süt & Kahvaltılık',
  'kaymak': 'Süt & Kahvaltılık',
  'lor': 'Süt & Kahvaltılık',
  'milk': 'Süt & Kahvaltılık',
  'cheese': 'Süt & Kahvaltılık',
  'egg': 'Süt & Kahvaltılık',
  'butter': 'Süt & Kahvaltılık',
  'yogurt': 'Süt & Kahvaltılık',

  // Fırın & Unlu Mamüller
  'ekmek': 'Fırın & Unlu Mamüller',
  'simit': 'Fırın & Unlu Mamüller',
  'poğaça': 'Fırın & Unlu Mamüller',
  'lavaş': 'Fırın & Unlu Mamüller',
  'yufka': 'Fırın & Unlu Mamüller',
  'pasta': 'Fırın & Unlu Mamüller',
  'kek': 'Fırın & Unlu Mamüller',
  'bread': 'Fırın & Unlu Mamüller',
  'cake': 'Fırın & Unlu Mamüller',

  // Et, Tavuk & Balık
  'kıyma': 'Et, Tavuk & Balık',
  'kuşbaşı': 'Et, Tavuk & Balık',
  'tavuk': 'Et, Tavuk & Balık',
  'tavuk göğsü': 'Et, Tavuk & Balık',
  'balık': 'Et, Tavuk & Balık',
  'somon': 'Et, Tavuk & Balık',
  'sucuk': 'Et, Tavuk & Balık',
  'sosis': 'Et, Tavuk & Balık',
  'salam': 'Et, Tavuk & Balık',
  'meat': 'Et, Tavuk & Balık',
  'chicken': 'Et, Tavuk & Balık',
  'fish': 'Et, Tavuk & Balık',

  // Temizlik & Hijyen
  'deterjan': 'Temizlik & Hijyen',
  'çamaşır suyu': 'Temizlik & Hijyen',
  'bulaşık deterjanı': 'Temizlik & Hijyen',
  'yumuşatıcı': 'Temizlik & Hijyen',
  'sabun': 'Temizlik & Hijyen',
  'şampuan': 'Kişisel Bakım',
  'diş macunu': 'Kişisel Bakım',
  'diş fırçası': 'Kişisel Bakım',
  'tuvalet kağıdı': 'Temizlik & Hijyen',
  'havlu kağıt': 'Temizlik & Hijyen',
  'ıslak mendil': 'Temizlik & Hijyen',
  'çöp poşeti': 'Temizlik & Hijyen',
  'soap': 'Temizlik & Hijyen',
  'shampoo': 'Kişisel Bakım',

  // Atıştırmalık & İçecek
  'kahve': 'Atıştırmalık & İçecek',
  'çay': 'Atıştırmalık & İçecek',
  'su': 'Atıştırmalık & İçecek',
  'maden suyu': 'Atıştırmalık & İçecek',
  'soda': 'Atıştırmalık & İçecek',
  'meyve suyu': 'Atıştırmalık & İçecek',
  'kola': 'Atıştırmalık & İçecek',
  'bisküvi': 'Atıştırmalık & İçecek',
  'çikolata': 'Atıştırmalık & İçecek',
  'cips': 'Atıştırmalık & İçecek',
  'fındık': 'Atıştırmalık & İçecek',
  'fıstık': 'Atıştırmalık & İçecek',
  'coffee': 'Atıştırmalık & İçecek',
  'tea': 'Atıştırmalık & İçecek',
  'water': 'Atıştırmalık & İçecek',
  'chocolate': 'Atıştırmalık & İçecek',

  // Kuru Gıda & Bakliyat
  'makarna': 'Kuru Gıda & Bakliyat',
  'pirinç': 'Kuru Gıda & Bakliyat',
  'bulgur': 'Kuru Gıda & Bakliyat',
  'mercimek': 'Kuru Gıda & Bakliyat',
  'nohut': 'Kuru Gıda & Bakliyat',
  'fasulye': 'Kuru Gıda & Bakliyat',
  'un': 'Kuru Gıda & Bakliyat',
  'şeker': 'Kuru Gıda & Bakliyat',
  'tuz': 'Kuru Gıda & Bakliyat',
  'sıvı yağ': 'Kuru Gıda & Bakliyat',
  'zeytinyağı': 'Kuru Gıda & Bakliyat',
  'salça': 'Kuru Gıda & Bakliyat',
  'pasta/rice': 'Kuru Gıda & Bakliyat',
  'sugar': 'Kuru Gıda & Bakliyat',
  'salt': 'Kuru Gıda & Bakliyat',
  'oil': 'Kuru Gıda & Bakliyat'
};

export function detectCategory(itemName: string): CategoryName {
  if (!itemName) return 'Diğer';
  const normalized = itemName.trim().toLowerCase();

  // Tam eşleşme
  if (DICTIONARY[normalized]) {
    return DICTIONARY[normalized];
  }

  // Kısmi eşleşme (ör. "1 kg domates" veya "yağlı süt")
  for (const [key, category] of Object.entries(DICTIONARY)) {
    if (normalized.includes(key)) {
      return category;
    }
  }

  return 'Diğer';
}
