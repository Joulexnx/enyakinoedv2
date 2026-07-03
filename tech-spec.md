# Teknik Spesifikasyon — En Yakın OED

## Bağımlılıklar

### Çekirdek
- react ^19.0.0
- react-dom ^19.0.0
- vite ^6.0.0
- typescript ^5.7.0
- tailwindcss ^4.0.0
- @tailwindcss/vite

### Harita
- leaflet ^1.9.4
- @types/leaflet
- react-leaflet ^5.0.0

### Animasyon & UI
- framer-motion ^12.0.0
- lucide-react

### Yazı Tipi
- @fontsource/inter (400, 500, 600, 700)

---

## Bileşen Envanteri

### Layout (Paylaşılan)
| Bileşen | Kaynak | Kullanım |
|---------|--------|----------|
| HeaderBar | Özel | Sabit üst bar, scroll'da gölge+blur |
| EmergencyAlertBanner | Özel | İtal bildirim şeridi, kapatılabilir |
| Footer | Özel | Basit alt bilgi |

### Bölümler (Sayfa)
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| HeroSection | Özel | Sol metin + sağ illüstrasyon, giriş animasyonları |
| StatisticsDashboard | Özel | 4'lü istatistik kartı ızgarası, sayaç animasyonu |
| MapSection | Özel | Leaflet harita, özel pin'ler, popup'lar |
| NearbyOEDList | Özel | Yatay OED kartları listesi |
| InformationPanel | Özel | 3 sütunlu bilgi kartları |
| QuickActionBar | Özel | Mobil sabit alt bar (112 + TYD) |
| QuickActionFAB | Özel | Masaüstü yüzen buton grubu |

### Yeniden Kullanılabilir Bileşenler
| Bileşen | Kaynak | Kullanım |
|---------|--------|----------|
| StatCard | Özel | 4 varyant (Count/Distance/Time/Status) |
| ActionButton | Özel | 3 varyant (Primary/Emergency/Secondary) |
| OEDLocationCard | Özel | Liste öğeleri, hover etkileşimi |
| SkeletonLoader | Özel | Yükleme iskeleti (shimmer) |

### Hooks
| Hook | Amaç |
|------|------|
| useScrollHeader | Scroll pozisyonuna göre header gölge/blur yönetimi |
| useInView | IntersectionObserver ile görünürlük takibi |
| useGeolocation | Konum alma, izin yönetimi, mesafe hesaplama |
| useAnimatedCounter | requestAnimationFrame ile sayaç animasyonu |

---

## Animasyon Planı

| Animasyon | Kütüphane | Uygulama | Karmaşıklık |
|-----------|-----------|----------|-------------|
| Hero metin girişi | framer-motion | staggerChildren + fadeInUp | Düşük |
| Hero illüstrasyon | framer-motion | fadeIn + scale | Düşük |
| Stat kart girişi | framer-motion | stagger fadeInUp + yOffset | Düşük |
| Sayaç animasyonu | Özel hook | useAnimatedCounter, rAF | Orta |
| Harita girişi | framer-motion | fadeIn + translateY | Düşük |
| Pin drop-in | framer-motion | translateY(-20px) + scale(0.5) → normal, bouncy | Orta |
| Pin pulse | CSS @keyframes | scale(1→1.4) opacity(1→0.4) loop | Düşük |
| Kart hover | Tailwind | transition + translateY + shadow tier | Düşük |
| Buton hover | Tailwind | transition + translateY + shadow | Düşük |
| Acil şerit slide | framer-motion | y: -48 → 0, dismiss y: 0 → -48 | Düşük |
| FAB hover | Tailwind | scale(1.08) + glow shadow | Düşük |
| Yükleme shimmer | CSS @keyframes | linear-gradient kayma | Düşük |
| OED kart girişi | framer-motion | stagger fadeIn + xOffset | Düşük |
| Bilgi kart girişi | framer-motion | stagger fadeInUp | Düşük |

**Karar:** Tüm animasyonlar framer-motion + CSS ile uygulanacak. GSAP gerekmez.

---

## State & Mimari

### Yerel State (useState)
- Konum izni durumu (idle/granted/denied)
- Kullanıcı koordinatları
- En yakın OED mesafesi
- Acil şerit görünürlüğü
- Seçili OED (harita popup)

### Ref'ler (useRef)
- Harita instance (Leaflet map)
- Scroll sentinel (header blur)

### Context Gerekmez — tek sayfa, düz bileşen hiyerarşisi.

---

## Harita Entegrasyonu

- **Kütüphane:** react-leaflet (Leaflet wrapper)
- **Tile:** CartoDB Positron (light theme)
- **Özel Pin'ler:** L.divIcon ile SVG marker'lar
- **Mesafe:** Haversine formülü (pure JS)
- **Konum:** navigator.geolocation API
- **Yol tarifi:** Google Maps directions URL'i

---

## Renk Sistemi

Tailwind tema eklentisi ile custom colors eklenecek. Token → Hex eşleşmesi design.md'den alınacak.

---

## Notlar

- Framer-motion kullanılacak ama layout animasyonları yok (layout prop kullanılmayacak)
- Özel CSS keyframe'ler (pulse, shimmer) tailwind.config veya inline @keyframes ile
- Leaflet CSS CDN üzerinden index.html'e eklenecek
- Özel pin SVG'leri inline olarak bileşen içinde tanımlanacak
