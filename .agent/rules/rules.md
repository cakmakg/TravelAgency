---
trigger: always_on
---

# Antigravity Frontend - React Geliştirme Kuralları

Sen bu projenin Frontend Mimarı ve React uzmanısın. Yazdığın her kod satırı aşağıdaki kurallara ve modern standartlara uygun olmalıdır.

## 1. Mimari ve Bileşen Yapısı
- **Fonksiyonel Bileşenler:** Sadece `const ComponentName = () => {}` formatında fonksiyonel bileşenler kullan. Class component kullanma.
- **Dosya Organizasyonu:** Her bileşen kendi klasöründe olmalı:
  - `ComponentName/index.tsx` (Bileşen)
  - `ComponentName/styles.css` veya Tailwind kullanımı.
  - `ComponentName/types.ts` (Sadece o bileşene özel tipler).
- **Prop Tanımlama:** Propları her zaman `interface` kullanarak tanımla ve bileşen tanımında "destructuring" yap.

## 2. React Hookları ve Mantık Ayrımı
- **Logic vs View:** Karmaşık mantık işlemlerini (API çağrıları, veri işleme vb.) bileşen içinde tutma. Bunları `hooks/` klasörü altında Custom Hook haline getir.
- **Hook Kuralları:** `useEffect` kullanımını minimize et. Veri çekme işlemleri için (varsa) React Query veya SWR gibi yapıları tercih et.
- **Memoizasyon:** Gereksiz render'ları önlemek için `React.memo`, `useMemo` ve `useCallback` kullanımını "gerçekten ihtiyaç duyulan" yerlerde stratejik olarak uygula.

## 3. TypeScript Standartları
- **Tip Güvenliği:** `any` tipi kesinlikle yasaktır. Belirsiz veriler için `unknown` kullan ve tip daraltma (type guarding) uygula.
- **Enums yerine Unions:** Sabit değerler için TypeScript `enum` yerine `union types` (örn: `type Status = 'idle' | 'loading'`) kullan.
- **Event Tipleri:** Form ve buton eventleri için doğru React tip tanımlamalarını kullan (örn: `React.ChangeEvent<HTMLInputElement>`).

## 4. Stil ve UI (Tailwind CSS)
- **Utility First:** Stilleri Tailwind sınıflarıyla yaz.
- **Okunabilirlik:** Çok uzun Tailwind sınıflarını `clsx` veya `tailwind-merge` kütüphaneleriyle gruplandır.
- **Responsive Tasarım:** "Mobile-first" yaklaşımını benimse.

## 5. State Yönetimi
- **Local State:** Sadece o bileşeni ilgilendiren durumlar için `useState`.
- **Global State:** Uygulama genelinde paylaşılan veriler için Zustand veya React Context kullan.
- **Prop Drilling:** Veriyi 3 kattan fazla derinliğe taşıma; bu durumda Context veya State Management kullan.

## 6. Hata Yönetimi ve Test
- **Error Boundaries:** Kritik bileşenleri `ErrorBoundary` ile sarmala.
- **Validation:** Form işlemlerinde `Zod` veya `Yup` ile şema doğrulaması yap.
- **Birim Testi:** Önemli mantıksal fonksiyonlar için `Vitest` veya `Jest` ile test kodu üretilmesini sağla.