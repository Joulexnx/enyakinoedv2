import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Search,
  Send,
  ShieldCheck,
  Star,
  UserRound,
  Users,
  ChevronDown,
  X,
  FileText,
  Loader2,
  AlertCircle,
  Image,
  Megaphone,
  MessageCircle,
} from 'lucide-react';

const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyBnMtkyE7RQUZ44nYhnIU4MIhBouX3wPLKt6oyYu26yeAm-f7kANrjkYirCePtOln97g/exec';

const PAYMENT_URLS = {
  standardMonthly: 'https://linkode.me/UxMuMqvo2h',
  premiumMonthly: 'https://linkode.me/hmzbhk4I2n',
  standardYearly: 'https://linkode.me/NgxvDUs4uD',
  premiumYearly: 'https://linkode.me/uv7NMpQGpK',
} as const;

type PackageName = 'Standart' | 'Premium';
type PaymentPeriod = 'Aylık' | 'Yıllık';

const PACKAGE_OPTIONS: Array<{
  name: PackageName;
  monthlyPrice: string;
  yearlyPrice: string;
  description: string;
  features: string[];
}> = [
  {
    name: 'Standart',
    monthlyPrice: '1.000 TL / ay',
    yearlyPrice: '10.000 TL / yıl',
    description: 'Temel eğitim merkezi listeleme paketi.',
    features: [
      'Eğitim merkezi profilinin listelenmesi',
      'Konum ve adres bilgilerinin gösterimi',
      'Telefon ve web sitesi bilgilerinin gösterimi',
    ],
  },
  {
    name: 'Premium',
    monthlyPrice: '2.000 TL / ay',
    yearlyPrice: '20.000 TL / yıl',
    description: 'Standart pakete ek olarak daha görünür ve zengin bir profil.',
    features: [
      'Standart paketteki tüm özellikler',
      'Premium rozeti',
      'Özel Premium profil kartı',
      'Logo ve merkez fotoğrafları',
      'WhatsApp iletişim butonu',
      'Premium Eğitim Merkezi alanı',
      'İlçe aramalarında öncelik',
      'Duyuru alanı',
    ],
  },
];

type CourseCenter = {
  id: number;
  name: string;
  representative: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  courses: string[];
  featured: boolean;
  package: string;
  showPhone: boolean;
  showWebsite: boolean;
  publishDate: string;
  endDate: string;
  logo: string;
  gallery: string[];
  whatsapp: string;
  announcement: string;
};

const districts = [
  'Tüm İlçeler',
  'Altındağ',
  'Çankaya',
  'Etimesgut',
  'Gölbaşı',
  'Keçiören',
  'Mamak',
  'Pursaklar',
  'Sincan',
  'Yenimahalle',
];

const courseTypes = [
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Temel İlk Yardım',
    description:
      'Temel ilk yardım eğitimi almak isteyenler için uygun eğitim merkezlerini keşfedin.',
  },
  {
    icon: <ShieldCheck className="w-5 h-5" />,
    title: 'İlk Yardım Eğitimi',
    description:
      'İlk yardım eğitimi veren ve platformumuzda yer alan eğitim merkezlerini inceleyin.',
  },
  {
    icon: <Users className="w-5 h-5" />,
    title: 'Kurumsal Eğitim',
    description:
      'İş yerleri ve kurumlar için ilk yardım eğitimi seçeneklerini değerlendirin.',
  },
];

function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value;

  const text = String(value ?? '')
    .trim()
    .toLocaleLowerCase('tr-TR');

  return ['evet', 'true', '1', 'yes', 'on', 'var'].includes(text);
}

function normalizeCourses(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  return String(value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}


function normalizeGallery(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  return String(value ?? '')
    .split(/[,\r\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeWhatsApp(value: unknown): string {
  return String(value ?? '')
    .replace(/[^0-9+]/g, '')
    .trim();
}

function normalizePackage(value: unknown): string {
  const packageName = String(value ?? '').trim();

  if (!packageName) {
    return 'Standart';
  }

  const normalized = packageName.toLocaleLowerCase('tr-TR');

  if (normalized === 'premium') {
    return 'Premium';
  }

  return packageName;
}

function getField(
  item: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const key of keys) {
    if (
      item[key] !== undefined &&
      item[key] !== null &&
      String(item[key]).trim() !== ''
    ) {
      return String(item[key]).trim();
    }
  }

  return '';
}

/**
 * Apps Script tarafı zaten sadece Onaylandı kayıtları döndürüyor.
 * Eğer API ayrıca Durum gönderirse onu da kontrol ediyoruz.
 * Durum hiç yoksa kaydı elemeden devam ediyoruz.
 */
function isPublished(item: Record<string, unknown>): boolean {
  /*
   * Yayın tarihi ve bitiş tarihi Apps Script tarafında
   * kontrol ediliyor. Frontend'de tekrar tarih parse etmiyoruz.
   *
   * Bunun nedeni Google Sheets'teki GG.AA.YYYY formatının
   * JavaScript'in new Date() parser'ı tarafından yanlış
   * yorumlanabilmesi.
   *
   * API Durum alanını gönderiyorsa ek güvenlik kontrolü yapıyoruz.
   * Durum alanı yoksa Apps Script filtresine güveniyoruz.
   */
  const status = getField(
    item,
    'durum',
    'Durum',
    'Durum ',
  )
    .trim()
    .toLocaleLowerCase('tr-TR');

  if (
    status &&
    status !== 'onaylandı' &&
    status !== 'onaylandi'
  ) {
    return false;
  }

  return true;
}

function normalizeCenter(
  item: Record<string, unknown>,
  index: number,
): CourseCenter {
  return {
    id: index + 1,

    name: getField(
      item,
      'merkezAdı',
      'merkezAdi',
      'Kurs Merkezi',
      'kurs merkezi',
      'centerName',
    ),

    representative: getField(
      item,
      'temsilci',
      'Yetkili',
      'representative',
    ),

    district: getField(
      item,
      'ilçe',
      'ilce',
      'İlçe',
      'district',
    ),

    address: getField(
      item,
      'adres',
      'Açık Adres',
      'açık adres',
      'address',
    ),

    phone: getField(
      item,
      'telefon',
      'Telefon',
      'phone',
    ),

    email: getField(
      item,
      'e-posta',
      'eposta',
      'E-posta',
      'Eposta',
      'email',
    ),

    website: getField(
      item,
      'web sitesi',
      'webSitesi',
      'Web Sitesi',
      'website',
    ),

    description: getField(
      item,
      'açıklama',
      'aciklama',
      'Açıklama',
      'description',
    ),

    courses: normalizeCourses(
      item['kurslar'] ??
        item['Eğitimler'] ??
        item['egitimler'] ??
        item['courses'],
    ),

    featured: parseBoolean(
      item['öne çıkan'] ??
        item['one cikan'] ??
        item['Öne Çıkan'] ??
        item['featured'],
    ),

    package: normalizePackage(
      getField(
        item,
        'paket',
        'Paket',
        'package',
      ),
    ),

    showPhone: parseBoolean(
      item['telefon göster'] ??
        item['Telefon Göster'] ??
        item['telefonGoster'] ??
        item['showPhone'],
    ),

    showWebsite: parseBoolean(
      item['web sitesi göster'] ??
        item['Web Sitesi Göster'] ??
        item['webSitesiGoster'] ??
        item['showWebsite'],
    ),

    publishDate: getField(
      item,
      'yayın tarihi',
      'Yayın Tarihi',
      'yayin tarihi',
      'Yayin Tarihi',
      'publishDate',
    ),

    endDate: getField(
      item,
      'bitiş tarihi',
      'Bitiş Tarihi',
      'bitis tarihi',
      'Bitis Tarihi',
      'endDate',
    ),

    logo: getField(
      item,
      'logo',
      'Logo',
    ),

    gallery: normalizeGallery(
      item['galeri'] ??
        item['Galeri'] ??
        item['gallery'],
    ),

    whatsapp: normalizeWhatsApp(
      getField(
        item,
        'whatsapp',
        'WhatsApp',
      ),
    ),

    announcement: getField(
      item,
      'duyuru',
      'Duyuru',
      'announcement',
    ),  };
}

function CourseCenterCard({
  center,
}: {
  center: CourseCenter;
}) {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${center.address}, ${center.district}, Ankara`,
  )}`;

  const isPremium =
    center.package.toLocaleLowerCase('tr-TR') === 'premium';

  const galleryImages = center.gallery.filter(Boolean);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const hasGallery = isPremium && galleryImages.length > 0;
  const galleryCount = galleryImages.length;

  const nextImage = () => {
    if (galleryCount < 2) return;

    setActiveImageIndex((current) =>
      current === galleryCount - 1 ? 0 : current + 1,
    );
  };

  const previousImage = () => {
    if (galleryCount < 2) return;

    setActiveImageIndex((current) =>
      current === 0 ? galleryCount - 1 : current - 1,
    );
  };

  const openLightbox = () => {
    if (!hasGallery) return;
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>,
  ) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (
    event: React.TouchEvent<HTMLDivElement>,
  ) => {
    if (touchStartX === null || galleryCount < 2) {
      setTouchStartX(null);
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? touchStartX;
    const difference = touchStartX - endX;

    if (Math.abs(difference) > 45) {
      if (difference > 0) {
        nextImage();
      } else {
        previousImage();
      }
    }

    setTouchStartX(null);
  };

  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeLightbox();
      }

      if (event.key === 'ArrowRight') {
        nextImage();
      }

      if (event.key === 'ArrowLeft') {
        previousImage();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isLightboxOpen, galleryCount]);

  return (
    <>
      <article
        className={`group relative overflow-hidden rounded-3xl bg-[var(--bg-card)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${
          isPremium
            ? 'border border-[rgba(23,106,246,0.45)] ring-1 ring-[rgba(23,106,246,0.08)]'
            : 'border border-[var(--border-subtle)]'
        }`}
      >
        {(center.featured || isPremium) && (
          <div className="absolute top-4 right-4 z-10 flex flex-col items-end gap-1.5">
            {center.featured && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-blue)] px-3 py-1.5 text-[11px] font-semibold text-white shadow-md">
                <Star className="w-3.5 h-3.5 fill-current" />
                Öne Çıkan
              </div>
            )}

            {isPremium && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-blue)] px-3 py-1.5 text-[11px] font-semibold text-white shadow-md">
                <Star className="w-3.5 h-3.5 fill-current" />
                Premium
              </div>
            )}
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[rgba(23,106,246,0.09)] text-[var(--accent-blue)] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {isPremium && center.logo ? (
                <img
                  src={center.logo}
                  alt={`${center.name} logosu`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              ) : (
                <Building2 className="w-6 h-6" />
              )}
            </div>

            <div className="min-w-0 pr-16">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] leading-snug">
                {center.name || 'Eğitim Merkezi'}
              </h3>

              <div className="mt-2 flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>
                  {center.district
                    ? `${center.district}, Ankara`
                    : 'Ankara'}
                </span>
              </div>
            </div>
          </div>

          {isPremium && (
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-[rgba(23,106,246,0.08)] px-2.5 py-1.5 text-xs font-semibold text-[var(--accent-blue)]">
              <Star className="w-3.5 h-3.5 fill-current" />
              Premium paket
            </div>
          )}

          {isPremium && center.announcement && (
            <div className="mt-4 rounded-2xl border border-[rgba(23,106,246,0.14)] bg-[rgba(23,106,246,0.05)] p-4">
              <div className="flex items-start gap-2.5">
                <Megaphone className="w-4 h-4 mt-0.5 text-[var(--accent-blue)] flex-shrink-0" />

                <div>
                  <div className="text-xs font-semibold text-[var(--accent-blue)]">
                    Duyuru
                  </div>

                  <p className="mt-1 text-sm text-[var(--text-secondary)] leading-relaxed">
                    {center.announcement}
                  </p>
                </div>
              </div>
            </div>
          )}

          {hasGallery && (
            <div className="mt-4">
              <div
                className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] group/gallery"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <button
                  type="button"
                  onClick={openLightbox}
                  className="relative block w-full h-56 sm:h-64 cursor-zoom-in overflow-hidden"
                  aria-label="Galeriyi büyüt"
                >
                  <img
                    src={galleryImages[activeImageIndex]}
                    alt={`${center.name} fotoğrafı ${activeImageIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/gallery:scale-[1.02]"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10 pointer-events-none" />

                  <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1.5 text-[11px] font-semibold text-white">
                    <Image className="w-3.5 h-3.5" />
                    {activeImageIndex + 1} / {galleryCount}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 pointer-events-none">
                    <span className="rounded-full bg-black/55 backdrop-blur-md px-3 py-1.5 text-[11px] font-medium text-white">
                      Görselleri büyütmek için dokunun
                    </span>

                    {galleryCount > 1 && (
                      <span className="rounded-full bg-black/55 backdrop-blur-md px-3 py-1.5 text-[11px] font-medium text-white">
                        Kaydır
                      </span>
                    )}
                  </div>
                </button>

                {galleryCount > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        previousImage();
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/55 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-all shadow-lg"
                      aria-label="Önceki görsel"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/55 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/70 transition-all shadow-lg"
                      aria-label="Sonraki görsel"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {galleryCount > 1 && (
                <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
                  {galleryImages.map((imageUrl, index) => (
                    <button
                      key={`${imageUrl}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 overflow-hidden rounded-lg border-2 transition-all ${
                        activeImageIndex === index
                          ? 'border-[var(--accent-blue)] ring-2 ring-[rgba(23,106,246,0.15)]'
                          : 'border-[var(--border-subtle)] opacity-70 hover:opacity-100'
                      }`}
                      aria-label={`${index + 1}. görseli göster`}
                    >
                      <img
                        src={imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />

                      {activeImageIndex === index && (
                        <div className="absolute inset-0 bg-[var(--accent-blue)]/10" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {center.description && (
            <p className="mt-4 text-sm text-[var(--text-secondary)] leading-relaxed">
              {center.description}
            </p>
          )}

          {center.courses.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {center.courses.map((course) => (
                <span
                  key={course}
                  className="rounded-lg bg-[var(--bg-primary)] border border-[var(--border-subtle)] px-2.5 py-1.5 text-xs text-[var(--text-secondary)]"
                >
                  {course}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 pt-5 border-t border-[var(--border-subtle)] space-y-2">
            {center.address && (
              <div className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <MapPin className="w-4 h-4 mt-0.5 text-[var(--accent-blue)] flex-shrink-0" />
                <span>{center.address}</span>
              </div>
            )}

            {center.showPhone && center.phone && (
              <a
                href={`tel:${center.phone}`}
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors"
              >
                <Phone className="w-4 h-4 text-[var(--accent-blue)]" />
                <span>{center.phone}</span>
              </a>
            )}

            {center.email && (
              <a
                href={`mailto:${center.email}`}
                className="flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors"
              >
                <Mail className="w-4 h-4 text-[var(--accent-blue)]" />
                <span className="truncate">{center.email}</span>
              </a>
            )}
          </div>

          <div
            className={`mt-6 grid gap-3 ${
              isPremium && center.whatsapp
                ? 'grid-cols-1 sm:grid-cols-3'
                : 'grid-cols-2'
            }`}
          >
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-[var(--accent-blue)] text-white text-sm font-semibold hover:brightness-95 transition-all"
            >
              <MapPin className="w-4 h-4" />
              Yol Tarifi
            </a>

            {isPremium && center.whatsapp ? (
              <a
                href={`https://wa.me/${center.whatsapp.replace(/^\+/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </a>
            ) : null}

            {center.showWebsite && center.website ? (
              <a
                href={
                  center.website.startsWith('http')
                    ? center.website
                    : `https://${center.website}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-primary)] text-sm font-semibold hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] transition-all"
              >
                <Globe className="w-4 h-4" />
                Web Sitesi
              </a>
            ) : (
              <div className="inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-[var(--text-secondary)] text-sm font-medium">
                <ShieldCheck className="w-4 h-4" />
                Onaylı Merkez
              </div>
            )}
          </div>
        </div>
      </article>

      {isLightboxOpen && hasGallery && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${center.name} fotoğraf galerisi`}
          onClick={closeLightbox}
        >
          <div
            className="relative w-full max-w-6xl h-full max-h-[92vh] flex flex-col items-center justify-center gap-4"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-1 right-1 sm:top-2 sm:right-2 z-30 w-11 h-11 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all"
              aria-label="Galeriyi kapat"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="absolute top-2 left-2 z-30 rounded-full bg-black/60 backdrop-blur-md px-3 py-1.5 text-xs font-semibold text-white">
              {activeImageIndex + 1} / {galleryCount}
            </div>

            <div className="relative w-full flex-1 min-h-0 flex items-center justify-center">
              <img
                src={galleryImages[activeImageIndex]}
                alt={`${center.name} fotoğrafı ${activeImageIndex + 1}`}
                className="max-w-full max-h-[78vh] object-contain rounded-2xl select-none"
              />

              {galleryCount > 1 && (
                <>
                  <button
                    type="button"
                    onClick={previousImage}
                    className="absolute left-1 sm:left-4 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all"
                    aria-label="Önceki görsel"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-1 sm:right-4 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all"
                    aria-label="Sonraki görsel"
                  >
                    <ArrowRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {galleryCount > 1 && (
              <div className="w-full overflow-x-auto pb-1">
                <div className="flex justify-center gap-2 min-w-max mx-auto px-2">
                  {galleryImages.map((imageUrl, index) => (
                    <button
                      key={`${imageUrl}-${index}`}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 overflow-hidden rounded-lg border-2 transition-all ${
                        activeImageIndex === index
                          ? 'border-white ring-2 ring-white/20'
                          : 'border-white/20 opacity-60 hover:opacity-100'
                      }`}
                      aria-label={`${index + 1}. görseli aç`}
                    >
                      <img
                        src={imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center text-xs text-white/70">
              {center.name}
              {galleryCount > 1
                ? ' • Kaydırarak veya okları kullanarak gezinebilirsiniz'
                : ''}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FieldLabel({
  children,
  required = false,
}: {
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
      {children}
      {required && (
        <span className="text-red-500 ml-1">*</span>
      )}
    </label>
  );
}

function InputField({
  icon,
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  required = false,
}: {
  icon: ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <FieldLabel required={required}>
        {label}
      </FieldLabel>

      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]">
          {icon}
        </div>

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
          className="w-full h-12 pl-11 pr-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:border-[var(--accent-blue)] focus:ring-2 focus:ring-[rgba(23,106,246,0.12)] transition-all"
        />
      </div>
    </div>
  );
}

function ListingApplicationModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    centerName: '',
    representative: '',
    phone: '',
    email: '',
    district: '',
    address: '',
    website: '',
    description: '',
    kvkk: false,
  });


  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [selectedPackage, setSelectedPackage] =
    useState<PackageName>('Standart');
  const [paymentPeriod, setPaymentPeriod] =
    useState<PaymentPeriod>('Aylık');

  const selectedPackageInfo = PACKAGE_OPTIONS.find(
    (item) => item.name === selectedPackage,
  ) ?? PACKAGE_OPTIONS[0];

  const selectedPrice =
    paymentPeriod === 'Aylık'
      ? selectedPackageInfo.monthlyPrice
      : selectedPackageInfo.yearlyPrice;

  const paymentUrl =
    selectedPackage === 'Premium'
      ? paymentPeriod === 'Aylık'
        ? PAYMENT_URLS.premiumMonthly
        : PAYMENT_URLS.premiumYearly
      : paymentPeriod === 'Aylık'
        ? PAYMENT_URLS.standardMonthly
        : PAYMENT_URLS.standardYearly;

  const toggleCourse = (course: string) => {
    setSelectedCourses((current) =>
      current.includes(course)
        ? current.filter((item) => item !== course)
        : [...current, course],
    );
  };

  const updateField = (
    field: keyof typeof form,
    value: string | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };


  const handleSubmit = async (
    event: React.FormEvent,
  ) => {
    event.preventDefault();
    setError('');

    if (
      !form.centerName.trim() ||
      !form.representative.trim() ||
      !form.phone.trim() ||
      !form.email.trim() ||
      !form.district ||
      !form.address.trim() ||
      selectedCourses.length === 0 ||
      !form.kvkk
    ) {
      setError(
        'Lütfen zorunlu alanların tamamını doldurun ve onay kutusunu işaretleyin.',
      );
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        centerName: form.centerName.trim(),
        representative: form.representative.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        district: form.district,
        address: form.address.trim(),
        website: form.website.trim(),
        courses: selectedCourses.join(', '),
        description: form.description.trim(),
        kvkk: form.kvkk,
        package: selectedPackage,
        paymentPeriod,
      };

      const response = await fetch(
        GOOGLE_SCRIPT_URL,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload),
        },
      );

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          'Başvuru gönderilemedi.',
        );
      }

      let result:
        | {
            success?: boolean;
            message?: string;
            mesaj?: string;
          }
        | null = null;

      try {
        result = JSON.parse(responseText);
      } catch {
        result = null;
      }

      if (result?.success === false) {
        throw new Error(
          result.message ||
            result.mesaj ||
            'Başvuru kaydedilemedi.',
        );
      }

      /*
       * Başvuru önce Google Sheets'e kaydedilir.
       * Kayıt başarılı olduktan sonra seçilen Linkode
       * ödeme sayfasına yönlendirilir.
       */
      window.location.href = paymentUrl;
    } catch (submitError) {
      console.error(
        'Kurs başvuru gönderim hatası:',
        submitError,
      );

      setError(
        'Başvuru gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="listing-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={
          submitting ? undefined : onClose
        }
      />

      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[var(--bg-card)] shadow-2xl border border-[var(--border-subtle)] text-[var(--text-primary)]">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-5 sm:px-7 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
          <div>
            <div className="flex items-center gap-2 text-[var(--accent-blue)] text-xs font-semibold">
              <Building2 className="w-4 h-4" />
              Eğitim Merkezi Başvurusu
            </div>

            <h2
              id="listing-modal-title"
              className="mt-1 text-lg sm:text-xl font-bold text-[var(--text-primary)]"
            >
              Eğitim merkezinizi listeleyin
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:bg-[var(--border-subtle)] transition-colors disabled:opacity-40"
            aria-label="Kapat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 sm:px-10 py-14 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="mt-6 text-2xl font-bold text-[var(--text-primary)]">
              Başvurunuz başarıyla alındı
            </h3>

            <p className="mt-3 max-w-md mx-auto text-sm text-[var(--text-secondary)] leading-relaxed">
              Eğitim merkezi bilgileriniz başvuru
              sistemimize kaydedildi. Ödeme sayfasına
              yönlendiriliyorsunuz.
            </p>

            <button
              type="button"
              onClick={onClose}
              className="mt-7 h-11 px-6 rounded-xl bg-[var(--accent-blue)] text-white text-sm font-semibold hover:brightness-95 transition-all"
            >
              Formu Kapat
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="p-5 sm:p-7 space-y-7">
              <div className="rounded-2xl bg-[rgba(23,106,246,0.06)] border border-[rgba(23,106,246,0.12)] p-4">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[var(--accent-blue)] mt-0.5 flex-shrink-0" />

                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">
                      Platformda yer almak için başvurun
                    </p>

                    <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                      Merkezinizin bilgilerini doldurun,
                      paketinizi seçin ve başvuruyu
                      göndererek ödeme sayfasına geçin.
                      Ödeme sonrası yayınlama işlemi
                      yönetim tarafından kontrol edilir.
                    </p>
                  </div>
                </div>
              </div>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Building2 className="w-5 h-5 text-[var(--accent-blue)]" />
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Eğitim Merkezi Bilgileri
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    icon={
                      <Building2 className="w-4 h-4" />
                    }
                    label="Kurs / Eğitim Merkezi Adı"
                    placeholder="Örn. ABC İlk Yardım Eğitim Merkezi"
                    value={form.centerName}
                    onChange={(value) =>
                      updateField(
                        'centerName',
                        value,
                      )
                    }
                    required
                  />

                  <InputField
                    icon={
                      <UserRound className="w-4 h-4" />
                    }
                    label="Yetkili Ad Soyad"
                    placeholder="Ad Soyad"
                    value={form.representative}
                    onChange={(value) =>
                      updateField(
                        'representative',
                        value,
                      )
                    }
                    required
                  />

                  <InputField
                    icon={
                      <Phone className="w-4 h-4" />
                    }
                    label="Telefon"
                    placeholder="05XX XXX XX XX"
                    value={form.phone}
                    onChange={(value) =>
                      updateField(
                        'phone',
                        value,
                      )
                    }
                    type="tel"
                    required
                  />

                  <InputField
                    icon={
                      <Mail className="w-4 h-4" />
                    }
                    label="E-posta"
                    placeholder="ornek@firma.com"
                    value={form.email}
                    onChange={(value) =>
                      updateField(
                        'email',
                        value,
                      )
                    }
                    type="email"
                    required
                  />
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-[var(--accent-blue)]" />
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Konum ve İletişim
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <FieldLabel required>
                      İlçe
                    </FieldLabel>

                    <div className="relative">
                      <select
                        value={form.district}
                        onChange={(event) =>
                          updateField(
                            'district',
                            event.target.value,
                          )
                        }
                        className="appearance-none w-full h-12 px-4 pr-10 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent-blue)] transition-all cursor-pointer"
                        required
                      >
                        <option
                          value=""
                          className="text-[var(--text-primary)]"
                        >
                          İlçe seçin
                        </option>

                        {districts
                          .filter(
                            (district) =>
                              district !==
                              'Tüm İlçeler',
                          )
                          .map((district) => (
                            <option
                              key={district}
                              value={district}
                              className="text-[var(--text-primary)]"
                            >
                              {district}
                            </option>
                          ))}
                      </select>

                      <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                    </div>
                  </div>

                  <div>
                    <FieldLabel required>
                      Açık Adres
                    </FieldLabel>

                    <textarea
                      value={form.address}
                      onChange={(event) =>
                        updateField(
                          'address',
                          event.target.value,
                        )
                      }
                      placeholder="Eğitim merkezinizin açık adresini yazın."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none resize-none focus:border-[var(--accent-blue)] transition-all"
                      required
                    />
                  </div>

                  <InputField
                    icon={
                      <Globe className="w-4 h-4" />
                    }
                    label="Web Sitesi"
                    placeholder="https://www.ornek.com"
                    value={form.website}
                    onChange={(value) =>
                      updateField(
                        'website',
                        value,
                      )
                    }
                    type="url"
                  />
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-[var(--accent-blue)]" />

                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Verdiğiniz Eğitimler
                    <span className="text-red-500 ml-1">
                      *
                    </span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    'Temel İlk Yardım',
                    'İlk Yardım Eğitimi',
                    'Kurumsal Eğitim',
                  ].map((course) => {
                    const selected =
                      selectedCourses.includes(
                        course,
                      );

                    return (
                      <button
                        key={course}
                        type="button"
                        onClick={() =>
                          toggleCourse(course)
                        }
                        className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                          selected
                            ? 'border-[var(--accent-blue)] bg-[rgba(23,106,246,0.07)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--accent-blue)]'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 ${
                            selected
                              ? 'bg-[var(--accent-blue)] border-[var(--accent-blue)] text-white'
                              : 'border-[var(--border-subtle)]'
                          }`}
                        >
                          {selected && (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </div>

                        <span className="text-xs sm:text-sm font-medium text-[var(--text-primary)]">
                          {course}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-[var(--accent-blue)]" />
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Paket Seçimi
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {PACKAGE_OPTIONS.map((option) => {
                    const selected =
                      selectedPackage === option.name;

                    return (
                      <button
                        key={option.name}
                        type="button"
                        onClick={() =>
                          setSelectedPackage(option.name)
                        }
                        className={`relative text-left rounded-2xl border p-5 transition-all ${
                          selected
                            ? 'border-[var(--accent-blue)] bg-[rgba(23,106,246,0.06)] ring-2 ring-[rgba(23,106,246,0.12)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--accent-blue)]'
                        }`}
                      >
                        {option.name === 'Premium' && (
                          <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-[var(--text-primary)] px-2.5 py-1 text-[10px] font-bold text-[var(--bg-card)]">
                            <Star className="w-3 h-3 fill-current" />
                            PREMIUM
                          </span>
                        )}

                        <div className="flex items-start gap-3 pr-20">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                              selected
                                ? 'bg-[var(--accent-blue)] text-white'
                                : 'bg-[rgba(23,106,246,0.09)] text-[var(--accent-blue)]'
                            }`}
                          >
                            {selected ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Building2 className="w-5 h-5" />
                            )}
                          </div>

                          <div>
                            <h4 className="text-base font-bold text-[var(--text-primary)]">
                              {option.name} Paket
                            </h4>
                            <p className="mt-1 text-xs text-[var(--text-secondary)] leading-relaxed">
                              {option.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          {option.features.map(
                            (feature) => (
                              <div
                                key={feature}
                                className="flex items-start gap-2 text-xs sm:text-sm text-[var(--text-secondary)]"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </div>
                            ),
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Clock3 className="w-5 h-5 text-[var(--accent-blue)]" />
                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Ödeme Dönemi
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {([
                    {
                      period: 'Aylık' as PaymentPeriod,
                      price: selectedPackageInfo.monthlyPrice,
                      description:
                        'Her ay yenilenen listeleme dönemi.',
                    },
                    {
                      period: 'Yıllık' as PaymentPeriod,
                      price: selectedPackageInfo.yearlyPrice,
                      description:
                        '12 aylık listeleme dönemi.',
                    },
                  ]).map((option) => {
                    const selected =
                      paymentPeriod === option.period;

                    return (
                      <button
                        key={option.period}
                        type="button"
                        onClick={() =>
                          setPaymentPeriod(option.period)
                        }
                        className={`flex items-center justify-between gap-4 rounded-2xl border p-4 text-left transition-all ${
                          selected
                            ? 'border-[var(--accent-blue)] bg-[rgba(23,106,246,0.06)] ring-2 ring-[rgba(23,106,246,0.12)]'
                            : 'border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--accent-blue)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                              selected
                                ? 'border-[var(--accent-blue)]'
                                : 'border-[var(--border-subtle)]'
                            }`}
                          >
                            {selected && (
                              <div className="w-2.5 h-2.5 rounded-full bg-[var(--accent-blue)]" />
                            )}
                          </div>

                          <div>
                            <div className="text-sm font-semibold text-[var(--text-primary)]">
                              {option.period}
                            </div>
                            <div className="mt-0.5 text-xs text-[var(--text-secondary)]">
                              {option.description}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm font-bold text-[var(--accent-blue)] whitespace-nowrap">
                          {option.price}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 rounded-xl border border-[rgba(23,106,246,0.14)] bg-[rgba(23,106,246,0.05)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-[var(--text-secondary)]">
                      Seçiminiz
                    </span>
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {selectedPackage} • {paymentPeriod} • {selectedPrice}
                    </span>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[var(--accent-blue)]" />

                  <h3 className="font-semibold text-[var(--text-primary)]">
                    Eğitim Merkezi Hakkında
                  </h3>
                </div>

                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      'description',
                      event.target.value,
                    )
                  }
                  placeholder="Eğitim merkeziniz ve sunduğunuz hizmetler hakkında kısa bilgi verebilirsiniz."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none resize-none focus:border-[var(--accent-blue)] transition-all"
                />
              </section>


              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.kvkk}
                  onChange={(event) =>
                    updateField(
                      'kvkk',
                      event.target.checked,
                    )
                  }
                  className="mt-1 w-4 h-4 accent-[var(--accent-blue)]"
                  required
                />

                <span className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Paylaştığım bilgilerin eğitim
                  merkezi başvurusu kapsamında
                  değerlendirilmesini kabul ediyorum.
                  <span className="text-red-500 ml-1">
                    *
                  </span>
                </span>
              </label>

              {error && (
                <div className="rounded-xl border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />

                    <p className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 border-t border-[var(--border-subtle)] bg-[var(--bg-card)] px-5 sm:px-7 py-4">
              <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-[var(--text-secondary)]">
                  <span className="text-red-500">*</span>{' '}
                  Zorunlu alanlar
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="h-11 px-5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-primary)] text-sm font-medium hover:bg-[var(--border-subtle)] transition-all disabled:opacity-50"
                  >
                    Vazgeç
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[var(--accent-blue)] text-white text-sm font-semibold hover:brightness-95 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Dosyalar yükleniyor...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Başvuruyu Gönder ve Ödeme Yap
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function FirstAidCourses() {
  const [searchTerm, setSearchTerm] =
    useState('');

  const [selectedDistrict, setSelectedDistrict] =
    useState('Tüm İlçeler');

  const [isApplicationOpen, setIsApplicationOpen] =
    useState(false);

  const [courseCenters, setCourseCenters] =
    useState<CourseCenter[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState('');

  useEffect(() => {
    let cancelled = false;

    const loadCourses = async () => {
      setLoading(true);
      setLoadError('');

      try {
        const response = await fetch(
          GOOGLE_SCRIPT_URL,
          {
            method: 'GET',
            cache: 'no-store',
          },
        );

        if (!response.ok) {
          throw new Error(
            `Sunucu ${response.status} hatası`,
          );
        }

        const data = await response.json();

        const apiSuccess =
          
          data?.basarili ??
          data?.success ??
          true;

        if (apiSuccess === false) {
          throw new Error(
            data?.mesaj ||
              data?.message ||
              data?.error ||
              'Kurs verileri alınamadı.',
          );
        }

        const rawCourses = Array.isArray(
          data?.kurslar,
        )
          ? data.kurslar
          : Array.isArray(data?.courses)
            ? data.courses
            : [];

        console.log(
          'Google Sheets kurs verileri:',
          rawCourses,
        );

        const visibleCourses = rawCourses
          .filter(
            (item: Record<string, unknown>) =>
              isPublished(item),
          )
          .map(
            (
              item: Record<string, unknown>,
              index: number,
            ) => normalizeCenter(item, index),
          )
          .filter((center) => center.name.trim() !== '')
          .sort((a, b) => {
            if (a.featured !== b.featured) {
              return a.featured ? -1 : 1;
            }

            const aPremium =
              a.package.toLocaleLowerCase('tr-TR') ===
              'premium';

            const bPremium =
              b.package.toLocaleLowerCase('tr-TR') ===
              'premium';

            if (aPremium !== bPremium) {
              return aPremium ? -1 : 1;
            }

            return a.name.localeCompare(
              b.name,
              'tr-TR',
            );
          });

        if (!cancelled) {
          setCourseCenters(
            visibleCourses,
          );
        }
      } catch (error) {
        console.error(
          'Eğitim merkezleri alınamadı:',
          error,
        );

        if (!cancelled) {
          setLoadError(
            'Eğitim merkezleri şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCenters = useMemo(() => {
    const normalizedSearch =
      searchTerm
        .toLocaleLowerCase('tr-TR')
        .trim();

    return courseCenters.filter(
      (center) => {
        const matchesSearch =
          !normalizedSearch ||
          center.name
            .toLocaleLowerCase('tr-TR')
            .includes(
              normalizedSearch,
            ) ||
          center.district
            .toLocaleLowerCase('tr-TR')
            .includes(
              normalizedSearch,
            ) ||
          center.courses.some(
            (course) =>
              course
                .toLocaleLowerCase(
                  'tr-TR',
                )
                .includes(
                  normalizedSearch,
                ),
          );

        const matchesDistrict =
          selectedDistrict ===
            'Tüm İlçeler' ||
          center.district ===
            selectedDistrict;

        return (
          matchesSearch &&
          matchesDistrict
        );
      },
    );
  }, [
    courseCenters,
    searchTerm,
    selectedDistrict,
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]/90 backdrop-blur-xl">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                window.location.href = '/';
              }}
              className="flex items-center gap-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--accent-blue)] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Ana Sayfa
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[var(--accent-blue)] flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>

              <div className="hidden sm:block">
                <div className="text-sm font-bold leading-none text-[var(--text-primary)]">
                  En Yakın OED
                </div>

                <div className="text-[10px] text-[var(--text-secondary)] mt-1">
                  İlk Yardım Eğitimleri
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-14 sm:pt-20 pb-12 sm:pb-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[rgba(23,106,246,0.08)] text-[var(--accent-blue)] text-xs sm:text-sm font-medium mb-5">
                <ShieldCheck className="w-4 h-4" />
                En Yakın OED İlk Yardım Ağı
              </div>

              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight text-[var(--text-primary)]">
                Ankara'da İlk Yardım
                <br className="hidden sm:block" />
                Eğitimi Alın
              </h1>

              <p className="mt-5 text-sm sm:text-lg text-[var(--text-secondary)] leading-relaxed max-w-2xl mx-auto">
                İlk yardım eğitimi almak isteyenler
                için platformumuzda yer alan eğitim
                merkezlerini keşfedin.
              </p>

              <div className="mt-8 max-w-3xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_190px] gap-3">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />

                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) =>
                        setSearchTerm(
                          event.target.value,
                        )
                      }
                      placeholder="Kurs merkezi veya ilçe ara..."
                      className="w-full h-14 pl-12 pr-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-sm sm:text-base text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] outline-none focus:ring-2 focus:ring-[rgba(23,106,246,0.2)] focus:border-[var(--accent-blue)] transition-all shadow-sm"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={selectedDistrict}
                      onChange={(event) =>
                        setSelectedDistrict(
                          event.target.value,
                        )
                      }
                      className="appearance-none w-full h-14 px-4 pr-10 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[rgba(23,106,246,0.2)] focus:border-[var(--accent-blue)] transition-all shadow-sm cursor-pointer"
                    >
                      {districts.map(
                        (district) => (
                          <option
                            key={district}
                            value={district}
                            className="text-[var(--text-primary)]"
                          >
                            {district}
                          </option>
                        ),
                      )}
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs sm:text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Onaylı eğitim merkezleri
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--accent-blue)]" />
                  Ankara geneli
                </div>

                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[var(--accent-blue)]" />
                  İlk yardım odaklı
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-14 bg-[var(--bg-card)] border-y border-[var(--border-subtle)]">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="text-center mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                Eğitim Seçeneklerini Keşfedin
              </h2>

              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                İhtiyacınıza uygun ilk yardım
                eğitimi için listelenen merkezleri
                inceleyin.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {courseTypes.map((item) => (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-5 hover:-translate-y-1 hover:shadow-lg transition-all duration-200"
                >
                  <div className="w-11 h-11 rounded-xl bg-[rgba(23,106,246,0.09)] text-[var(--accent-blue)] flex items-center justify-center mb-4">
                    {item.icon}
                  </div>

                  <h3 className="font-semibold text-base text-[var(--text-primary)]">
                    {item.title}
                  </h3>

                  <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[var(--accent-blue)]">
                    Eğitim türünü keşfet
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[var(--text-primary)]">
                    Eğitim Merkezleri
                  </h2>

                  {!loading && (
                    <span className="rounded-full bg-[rgba(23,106,246,0.08)] text-[var(--accent-blue)] px-2.5 py-1 text-xs font-semibold">
                      {filteredCenters.length}
                    </span>
                  )}
                </div>

                <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
                  Platformumuzda yer alan onaylı ilk
                  yardım eğitim merkezlerini inceleyin.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                <MapPin className="w-4 h-4" />
                Ankara
              </div>
            </div>

            {loading ? (
              <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-12 text-center shadow-sm">
                <Loader2 className="w-9 h-9 mx-auto text-[var(--accent-blue)] animate-spin" />

                <h3 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
                  Eğitim merkezleri yükleniyor
                </h3>

                <p className="mt-2 text-sm text-[var(--text-secondary)]">
                  Güncel liste hazırlanıyor...
                </p>
              </div>
            ) : loadError ? (
              <div className="rounded-3xl border border-red-200 dark:border-red-500/20 bg-[var(--bg-card)] p-8 sm:p-12 text-center shadow-sm">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-[var(--text-primary)]">
                  Liste yüklenemedi
                </h3>

                <p className="mt-2 max-w-md mx-auto text-sm text-[var(--text-secondary)]">
                  {loadError}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    window.location.reload()
                  }
                  className="mt-6 h-11 px-5 rounded-xl bg-[var(--accent-blue)] text-white text-sm font-semibold"
                >
                  Tekrar Dene
                </button>
              </div>
            ) : filteredCenters.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredCenters.map(
                  (center) => (
                    <CourseCenterCard
                      key={center.id}
                      center={center}
                    />
                  ),
                )}
              </div>
            ) : (
              <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden shadow-sm">
                <div className="p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[rgba(23,106,246,0.08)] text-[var(--accent-blue)] flex items-center justify-center">
                    <Building2 className="w-8 h-8" />
                  </div>

                  <h3 className="mt-6 text-xl font-semibold text-[var(--text-primary)]">
                    {courseCenters.length > 0
                      ? 'Aramanıza uygun merkez bulunamadı'
                      : 'Henüz listelenen eğitim merkezi yok'}
                  </h3>

                  <p className="mt-3 max-w-xl mx-auto text-sm text-[var(--text-secondary)] leading-relaxed">
                    {courseCenters.length > 0
                      ? 'Arama veya ilçe filtresini değiştirerek tekrar deneyebilirsiniz.'
                      : 'En Yakın OED platformunda yer almak isteyen ilk yardım eğitim merkezleri başvuru yaparak işletme bilgilerini yayınlatabilir.'}
                  </p>

                  {courseCenters.length ===
                    0 && (
                    <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setIsApplicationOpen(
                            true,
                          )
                        }
                        className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[var(--accent-blue)] text-white text-sm font-semibold hover:brightness-95 transition-all shadow-sm"
                      >
                        Eğitim Merkezimi Listele
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <div className="inline-flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <Clock3 className="w-4 h-4" />
                        Başvurular değerlendirilmektedir
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        <section
          id="course-listing"
          className="py-12 sm:py-16 bg-[var(--bg-card)] border-y border-[var(--border-subtle)]"
        >
          <div className="max-w-[1100px] mx-auto px-4 sm:px-6">
            <div className="rounded-3xl bg-[var(--bg-primary)] border border-[var(--border-subtle)] overflow-hidden">
              <div className="p-7 sm:p-10">
                <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(23,106,246,0.08)] text-[var(--accent-blue)] px-3 py-1.5 text-xs font-semibold">
                      <Building2 className="w-4 h-4" />
                      Eğitim merkezleri için
                    </div>

                    <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                      Eğitim merkezinizi
                      <br className="hidden sm:block" />
                      En Yakın OED'de listeleyin
                    </h2>

                    <p className="mt-4 max-w-2xl text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                      Eğitim merkezinizi Ankara'da
                      ilk yardım eğitimi arayan
                      kullanıcılara ulaştırın.
                      Merkezinizin iletişim, konum
                      ve eğitim bilgilerini platformda
                      yayınlamak için başvuru
                      oluşturabilirsiniz.
                    </p>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        Profil görünürlüğü
                      </div>

                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        Konum bilgisi
                      </div>

                      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        İletişim bilgileri
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setIsApplicationOpen(
                        true,
                      )
                    }
                    className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl bg-[var(--accent-blue)] text-white text-sm font-semibold hover:brightness-95 transition-all shadow-sm whitespace-nowrap"
                  >
                    Başvuru Yap
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="max-w-[900px] mx-auto px-4 sm:px-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-[rgba(23,106,246,0.08)] text-[var(--accent-blue)] flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h2 className="mt-5 text-xl sm:text-2xl font-semibold text-[var(--text-primary)]">
              En Yakın OED İlk Yardım Eğitim Ağı
            </h2>

            <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
              Bu alan, ilk yardım eğitimi almak
              isteyen kullanıcılarla platformda yer
              alan eğitim merkezlerini buluşturmak
              amacıyla oluşturulmuştur. Listelenen
              merkezlerin iletişim ve eğitim
              bilgileri kullanıcıların eğitim
              merkeziyle doğrudan iletişim
              kurabilmesine yardımcı olur.
            </p>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-[var(--border-subtle)] bg-[var(--bg-primary)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-[var(--text-secondary)]">
              En Yakın OED • İlk Yardım Eğitimleri
            </p>

            <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <ExternalLink className="w-3.5 h-3.5" />
              Eğitim merkezi başvuruları
            </div>
          </div>
        </div>
      </footer>

      {isApplicationOpen && (
        <ListingApplicationModal
          onClose={() =>
            setIsApplicationOpen(false)
          }
        />
      )}
    </div>
  );
}


