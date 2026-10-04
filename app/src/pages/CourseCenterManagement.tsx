import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  ImagePlus,
  Info,
  Loader2,
  MapPin,
  Megaphone,
  Pencil,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  UserRound,
  Users,
  X,
} from 'lucide-react';

const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbyBnMtkyE7RQUZ44nYhnIU4MIhBouX3wPLKt6oyYu26yeAm-f7kANrjkYirCePtOln97g/exec';

const MAX_GALLERY = 5;

type ManagementCenter = {
  kursId: string;
  centerName: string;
  representative: string;
  phone: string;
  email: string;
  district: string;
  address: string;
  website: string;
  courses: string;
  description: string;
  logo: string;
  gallery: string[];
  whatsapp: string;
  announcement: string;
  package?: string;
  status?: string;
  featured?: string;
  showPhone?: string;
  showWebsite?: string;
  publishDate?: string;
  endDate?: string;
  paymentPeriod?: string;
};

type UploadFile = {
  name: string;
  mimeType: string;
  data: string;
};

function getManagementKey() {
  const params = new URLSearchParams(
    window.location.search
  );

  return params.get('key')?.trim() || '';
}

function fileToBase64(
  file: File
): Promise<UploadFile> {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () => {
        resolve({
          name: file.name,
          mimeType:
            file.type || 'image/jpeg',
          data: String(
            reader.result
          ),
        });
      };

      reader.onerror = () => {
        reject(
          new Error(
            'Dosya okunamadı.'
          )
        );
      };

      reader.readAsDataURL(file);
    }
  );
}

function normalizeGallery(
  value: unknown
): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .filter(Boolean)
      .map(String);
  }

  return String(value)
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}


/* =========================================================
   INPUT
========================================================= */

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
        {icon && (
          <span className="text-[var(--accent-blue)]">
            {icon}
          </span>
        )}
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-blue)] focus:ring-4 focus:ring-[var(--accent-blue)]/10"
      />
    </label>
  );
}


/* =========================================================
   TEXTAREA
========================================================= */

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
        {icon && (
          <span className="text-[var(--accent-blue)]">
            {icon}
          </span>
        )}
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        rows={rows}
        className="w-full resize-y rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3.5 text-sm leading-6 text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-secondary)] focus:border-[var(--accent-blue)] focus:ring-4 focus:ring-[var(--accent-blue)]/10"
      />
    </label>
  );
}


/* =========================================================
   SECTION HEADER
========================================================= */

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
        {icon}
      </div>

      <div>
        <h2 className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
          {title}
        </h2>

        <p className="mt-1 text-sm leading-5 text-[var(--text-secondary)]">
          {description}
        </p>
      </div>
    </div>
  );
}


/* =========================================================
   STATUS CARD
========================================================= */

function StatusCard({
  label,
  value,
  icon,
  accent = 'blue',
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent?: 'blue' | 'green' | 'gold';
}) {
  const classes =
    accent === 'green'
      ? 'bg-emerald-500/10 text-emerald-500'
      : accent === 'gold'
      ? 'bg-amber-500/10 text-amber-500'
      : 'bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]';

  return (
    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {label}
        </span>

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-xl ${classes}`}
        >
          {icon}
        </span>
      </div>

      <div className="mt-3 truncate text-sm font-bold text-[var(--text-primary)]">
        {value || '-'}
      </div>
    </div>
  );
}


/* =========================================================
   MAIN
========================================================= */

export default function CourseCenterManagement() {
  const managementKey = useMemo(
    () => getManagementKey(),
    []
  );

  const logoInputRef =
    useRef<HTMLInputElement>(null);

  const galleryInputRef =
    useRef<HTMLInputElement>(null);

  const [center, setCenter] =
    useState<ManagementCenter | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [logoUpload, setLogoUpload] =
    useState<UploadFile | null>(null);

  const [removeLogo, setRemoveLogo] =
    useState(false);

  const [galleryUploads, setGalleryUploads] =
    useState<UploadFile[]>([]);

  const [removedGallery, setRemovedGallery] =
    useState<string[]>([]);

  const [dirty, setDirty] =
    useState(false);

  const [copied, setCopied] =
    useState(false);

  const managementUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : '';


  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    if (!managementKey) {
      setLoading(false);

      setError(
        'Yönetim bağlantısı geçersiz. Lütfen size verilen yönetim bağlantısını kullanın.'
      );

      return;
    }

    async function loadCenter() {
      try {
        setLoading(true);
        setError('');

        const response =
          await fetch(
            `${GOOGLE_SCRIPT_URL}?key=${encodeURIComponent(
              managementKey
            )}`
          );

        const data =
          await response.json();

        if (
          !data?.success ||
          !data?.center
        ) {
          throw new Error(
            data?.error ||
              'Kurs merkezi bilgileri alınamadı.'
          );
        }

        setCenter({
          ...data.center,
          gallery:
            normalizeGallery(
              data.center.gallery
            ),
        });

        setDirty(false);

      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Kurs merkezi bilgileri alınamadı.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadCenter();
  }, [managementKey]);


  /* =======================================================
     UPDATE FIELD
  ======================================================= */

  function updateField(
    field: keyof ManagementCenter,
    value: string
  ) {
    setCenter((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );

    setDirty(true);
    setSuccess('');
  }


  /* =======================================================
     LOGO
  ======================================================= */

  async function handleLogoChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        'image/'
      )
    ) {
      setError(
        'Logo için yalnızca görsel dosyası seçebilirsiniz.'
      );

      return;
    }

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      setError(
        'Logo dosyası en fazla 2 MB olabilir.'
      );

      return;
    }

    try {
      const upload =
        await fileToBase64(file);

      setLogoUpload(upload);
      setRemoveLogo(false);
      setDirty(true);
      setSuccess('');
      setError('');

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Logo yüklenemedi.'
      );
    }

    event.target.value = '';
  }


  /* =======================================================
     GALLERY
  ======================================================= */

  async function handleGalleryChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files || []
    );

    if (
      !files.length ||
      !center
    ) {
      return;
    }

    const currentCount =
      center.gallery.length +
      galleryUploads.length;

    const remainingSlots =
      MAX_GALLERY -
      currentCount;

    if (
      files.length >
      remainingSlots
    ) {
      setError(
        `Galeride ${remainingSlots > 0 ? `en fazla ${remainingSlots}` : 'daha fazla'} görsel ekleyebilirsiniz.`
      );

      event.target.value = '';

      return;
    }

    try {
      const validFiles: File[] =
        [];

      for (
        const file of files
      ) {
        if (
          !file.type.startsWith(
            'image/'
          )
        ) {
          throw new Error(
            `${file.name} bir görsel dosyası değil.`
          );
        }

        if (
          file.size >
          4 * 1024 * 1024
        ) {
          throw new Error(
            `${file.name} 4 MB sınırını aşıyor.`
          );
        }

        validFiles.push(file);
      }

      const uploads =
        await Promise.all(
          validFiles.map(
            fileToBase64
          )
        );

      setGalleryUploads(
        (current) => [
          ...current,
          ...uploads,
        ]
      );

      setDirty(true);
      setSuccess('');
      setError('');

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Galeri görselleri yüklenemedi.'
      );
    }

    event.target.value = '';
  }


  function removeExistingGalleryImage(
    imageUrl: string
  ) {
    if (!center) return;

    setCenter({
      ...center,
      gallery:
        center.gallery.filter(
          (image) =>
            image !== imageUrl
        ),
    });

    setRemovedGallery(
      (current) =>
        current.includes(
          imageUrl
        )
          ? current
          : [
              ...current,
              imageUrl,
            ]
    );

    setDirty(true);
    setSuccess('');
  }


  function removeNewGalleryImage(
    index: number
  ) {
    setGalleryUploads(
      (current) =>
        current.filter(
          (_, currentIndex) =>
            currentIndex !== index
        )
    );

    setDirty(true);
  }


  function handleRemoveLogo() {
    setLogoUpload(null);
    setRemoveLogo(true);
    setDirty(true);
    setSuccess('');
  }


  /* =======================================================
     COPY LINK
  ======================================================= */

  async function copyManagementLink() {
    try {
      await navigator.clipboard.writeText(
        managementUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);

    } catch {
      setError(
        'Yönetim bağlantısı kopyalanamadı.'
      );
    }
  }


  /* =======================================================
     SAVE
  ======================================================= */

  async function handleSave() {
    if (!center) return;

    if (
      !center.centerName.trim()
    ) {
      setError(
        'Kurs merkezi adı boş bırakılamaz.'
      );

      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response =
        await fetch(
          GOOGLE_SCRIPT_URL,
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'text/plain;charset=utf-8',
            },

            body: JSON.stringify({
              action:
                'updateCenter',

              managementKey,

              center: {
                centerName:
                  center.centerName,

                representative:
                  center.representative,

                phone:
                  center.phone,

                email:
                  center.email,

                district:
                  center.district,

                address:
                  center.address,

                website:
                  center.website,

                courses:
                  center.courses,

                description:
                  center.description,

                whatsapp:
                  center.whatsapp,

                announcement:
                  center.announcement,
              },

              uploads: {
                ...(logoUpload
                  ? {
                      logo:
                        logoUpload,
                    }
                  : {}),

                gallery:
                  galleryUploads,
              },

              removeLogo,

              removeGallery:
                removedGallery,
            }),
          }
        );

      const text =
        await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          'Sunucudan geçerli bir cevap alınamadı.'
        );
      }

      if (!data?.success) {
        throw new Error(
          data?.error ||
            'Değişiklikler kaydedilemedi.'
        );
      }

      setCenter({
        ...data.center,
        gallery:
          normalizeGallery(
            data.center?.gallery
          ),
      });

      setLogoUpload(null);
      setGalleryUploads([]);
      setRemovedGallery([]);
      setRemoveLogo(false);
      setDirty(false);

      setSuccess(
        'Bilgileriniz başarıyla güncellendi.'
      );

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Değişiklikler kaydedilemedi.'
      );

    } finally {
      setSaving(false);
    }
  }


  /* =======================================================
     BACK
  ======================================================= */

  function handleBack() {
    if (
      dirty &&
      !window.confirm(
        'Kaydedilmemiş değişiklikleriniz var. Sayfadan çıkmak istediğinize emin misiniz?'
      )
    ) {
      return;
    }

    window.location.href =
      '/ilk-yardim-kurslari';
  }


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] px-4 pb-24 pt-8">
        <div className="mx-auto flex min-h-[75vh] max-w-3xl items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--accent-blue)]/10">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-blue)]" />
            </div>

            <h1 className="text-lg font-bold text-[var(--text-primary)]">
              Yönetim paneli hazırlanıyor
            </h1>

            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Kurs merkezi bilgileriniz yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (!center) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] px-4 pb-24 pt-8">
        <div className="mx-auto flex min-h-[75vh] max-w-lg items-center">
          <div className="w-full rounded-3xl border border-red-500/20 bg-red-500/5 p-7">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
              <X className="h-6 w-6" />
            </div>

            <h1 className="mt-5 text-xl font-bold text-[var(--text-primary)]">
              Yönetim paneli açılamadı
            </h1>

            <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
              {error ||
                'Geçersiz yönetim bağlantısı.'}
            </p>

            <button
              type="button"
              onClick={() =>
                (window.location.href =
                  '/ilk-yardim-kurslari')
              }
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-[var(--accent-blue)] px-5 py-3 text-sm font-bold text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Kurs Merkezlerine Dön
            </button>
          </div>
        </div>
      </div>
    );
  }


  const displayedGallery =
    center.gallery;

  const galleryCount =
    displayedGallery.length +
    galleryUploads.length;


  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] px-4 pb-36 pt-5 sm:px-6 sm:pt-8">

      <div className="mx-auto max-w-6xl">

        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kurs Merkezlerine Dön
          </button>

          <div className="flex items-center gap-2">

            {dirty && (
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-500">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Kaydedilmemiş değişiklik
              </div>
            )}

            {center.status && (
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {center.status}
              </div>
            )}

          </div>
        </div>


        {/* =================================================
            HERO
        ================================================= */}

        <section className="relative mb-5 overflow-hidden rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm">

          <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-[var(--accent-blue)]/10 blur-3xl" />

          <div className="relative p-5 sm:p-7">

            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

              <div className="flex min-w-0 items-center gap-4">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-primary)] shadow-sm sm:h-24 sm:w-24">

                  {center.logo &&
                  !removeLogo ? (
                    <img
                      src={center.logo}
                      alt={
                        center.centerName
                      }
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <ImagePlus className="h-8 w-8 text-[var(--text-secondary)]" />
                  )}

                </div>

                <div className="min-w-0">

                  <div className="mb-2 flex flex-wrap items-center gap-2">

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-blue)]/10 px-2.5 py-1 text-[11px] font-bold text-[var(--accent-blue)]">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Kurs Merkezi Yönetimi
                    </span>

                    {center.package && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {center.package}
                      </span>
                    )}

                  </div>

                  <h1 className="truncate text-xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
                    {center.centerName}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--text-secondary)]">

                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[var(--accent-blue)]" />
                      {center.district ||
                        'İlçe belirtilmedi'}
                    </span>

                    <span className="font-mono text-xs">
                      {center.kursId}
                    </span>

                  </div>

                </div>

              </div>


              <div className="flex flex-wrap gap-2">

                <a
                  href="/ilk-yardim-kurslari"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-3 text-sm font-bold text-[var(--text-primary)] transition hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
                >
                  <ExternalLink className="h-4 w-4" />
                  Siteyi Gör
                </a>

                <button
                  type="button"
                  onClick={
                    copyManagementLink
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--accent-blue)] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Kopyalandı
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-4 w-4" />
                      Yönetim Linki
                    </>
                  )}
                </button>

              </div>

            </div>

          </div>

        </section>


        {/* =================================================
            ALERTS
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3.5 text-sm text-red-500">
            <X className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3.5 text-sm font-medium text-emerald-500">
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}


        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

          <StatusCard
            label="Paket"
            value={
              center.package || '-'
            }
            icon={
              <Star className="h-4 w-4" />
            }
            accent="gold"
          />

          <StatusCard
            label="Durum"
            value={
              center.status || '-'
            }
            icon={
              <CheckCircle2 className="h-4 w-4" />
            }
            accent="green"
          />

          <StatusCard
            label="Yayın Tarihi"
            value={
              center.publishDate ||
              '-'
            }
            icon={
              <Info className="h-4 w-4" />
            }
          />

          <StatusCard
            label="Galeri"
            value={`${galleryCount} / ${MAX_GALLERY}`}
            icon={
              <ImagePlus className="h-4 w-4" />
            }
          />

        </section>


        {/* =================================================
            MAIN
        ================================================= */}

        <div className="space-y-5">

          {/* =================================================
              BASIC INFORMATION
          ================================================= */}

          <section className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-sm sm:p-7">

            <SectionHeader
              icon={
                <UserRound className="h-5 w-5" />
              }
              title="Temel Bilgiler"
              description="Kurs merkezinizin iletişim ve tanıtım bilgilerini güncelleyin."
            />

            <div className="grid gap-5 sm:grid-cols-2">

              <InputField
                label="Kurs Merkezi"
                value={
                  center.centerName
                }
                onChange={(value) =>
                  updateField(
                    'centerName',
                    value
                  )
                }
                placeholder="Kurs merkezi adı"
              />

              <InputField
                label="Yetkili"
                value={
                  center.representative
                }
                onChange={(value) =>
                  updateField(
                    'representative',
                    value
                  )
                }
                placeholder="Yetkili adı"
              />

              <InputField
                label="Telefon"
                value={center.phone}
                onChange={(value) =>
                  updateField(
                    'phone',
                    value
                  )
                }
                placeholder="05xx xxx xx xx"
                icon={
                  <Phone className="h-4 w-4" />
                }
              />

              <InputField
                label="WhatsApp"
                value={
                  center.whatsapp
                }
                onChange={(value) =>
                  updateField(
                    'whatsapp',
                    value
                  )
                }
                placeholder="905xxxxxxxxx"
              />

              <InputField
                label="E-posta"
                value={center.email}
                onChange={(value) =>
                  updateField(
                    'email',
                    value
                  )
                }
                placeholder="ornek@firma.com"
                type="email"
              />

              <InputField
                label="İlçe"
                value={
                  center.district
                }
                onChange={(value) =>
                  updateField(
                    'district',
                    value
                  )
                }
                placeholder="Çankaya"
                icon={
                  <MapPin className="h-4 w-4" />
                }
              />

              <div className="sm:col-span-2">

                <InputField
                  label="Web Sitesi"
                  value={
                    center.website
                  }
                  onChange={(value) =>
                    updateField(
                      'website',
                      value
                    )
                  }
                  placeholder="https://..."
                />

              </div>

              <div className="sm:col-span-2">

                <TextAreaField
                  label="Açık Adres"
                  value={
                    center.address
                  }
                  onChange={(value) =>
                    updateField(
                      'address',
                      value
                    )
                  }
                  placeholder="Kurs merkezinizin açık adresi"
                  rows={3}
                  icon={
                    <MapPin className="h-4 w-4" />
                  }
                />

              </div>

            </div>

          </section>


          {/* =================================================
              COURSE CONTENT
          ================================================= */}

          <section className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-sm sm:p-7">

            <SectionHeader
              icon={
                <Users className="h-5 w-5" />
              }
              title="Eğitim ve Tanıtım"
              description="Verdiğiniz eğitimleri, açıklamanızı ve güncel duyurularınızı yönetin."
            />

            <div className="space-y-5">

              <InputField
                label="Eğitimler"
                value={
                  center.courses
                }
                onChange={(value) =>
                  updateField(
                    'courses',
                    value
                  )
                }
                placeholder="Temel İlk Yardım, İlk Yardım Eğitimi..."
              />

              <TextAreaField
                label="Kurs Merkezi Açıklaması"
                value={
                  center.description
                }
                onChange={(value) =>
                  updateField(
                    'description',
                    value
                  )
                }
                placeholder="Kurs merkezinizi tanıtan açıklama"
                rows={6}
                icon={
                  <Info className="h-4 w-4" />
                }
              />

              <TextAreaField
                label="Duyuru"
                value={
                  center.announcement
                }
                onChange={(value) =>
                  updateField(
                    'announcement',
                    value
                  )
                }
                placeholder="Örneğin: Ekim ayı ilk yardım eğitim kayıtlarımız başladı."
                rows={4}
                icon={
                  <Megaphone className="h-4 w-4" />
                }
              />

            </div>

          </section>


          {/* =================================================
              LOGO
          ================================================= */}

          <section className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-sm sm:p-7">

            <SectionHeader
              icon={
                <ImagePlus className="h-5 w-5" />
              }
              title="Logo"
              description="Kurs merkezinizin kartında gösterilecek logoyu yönetin."
            />

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

              <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-primary)]">

                {logoUpload ? (
                  <img
                    src={
                      logoUpload.data
                    }
                    alt="Yeni logo"
                    className="h-full w-full object-contain p-4"
                  />
                ) : center.logo &&
                  !removeLogo ? (
                  <img
                    src={center.logo}
                    alt={
                      center.centerName
                    }
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <ImagePlus className="h-9 w-9 text-[var(--text-secondary)]" />
                )}

              </div>

              <div className="min-w-0">

                <div className="flex flex-wrap gap-2">

                  <button
                    type="button"
                    onClick={() =>
                      logoInputRef.current?.click()
                    }
                    className="inline-flex items-center gap-2 rounded-2xl bg-[var(--accent-blue)] px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
                  >
                    <Upload className="h-4 w-4" />
                    {center.logo
                      ? 'Logo Değiştir'
                      : 'Logo Yükle'}
                  </button>

                  {(center.logo ||
                    logoUpload) &&
                    !removeLogo && (
                      <button
                        type="button"
                        onClick={
                          handleRemoveLogo
                        }
                        className="inline-flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-bold text-red-500 transition hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Logoyu Kaldır
                      </button>
                    )}

                </div>

                <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
                  JPG, PNG veya WEBP
                  <br />
                  Maksimum dosya boyutu:
                  2 MB
                </p>

              </div>

              <input
                ref={logoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={
                  handleLogoChange
                }
              />

            </div>

          </section>


          {/* =================================================
              GALLERY
          ================================================= */}

          <section className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-sm sm:p-7">

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <SectionHeader
                icon={
                  <ImagePlus className="h-5 w-5" />
                }
                title="Galeri"
                description="Kurs merkezinizi gösteren fotoğrafları yönetin."
              />

              <div className="shrink-0 rounded-2xl bg-[var(--accent-blue)]/10 px-4 py-3 text-center">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]">
                  Görsel
                </div>

                <div className="mt-0.5 text-lg font-bold text-[var(--accent-blue)]">
                  {galleryCount}
                  <span className="text-sm font-medium text-[var(--text-secondary)]">
                    {' '}
                    / {MAX_GALLERY}
                  </span>
                </div>
              </div>

            </div>

            {galleryCount === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-primary)] p-8 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent-blue)]/10 text-[var(--accent-blue)]">
                  <ImagePlus className="h-7 w-7" />
                </div>

                <h3 className="mt-4 font-bold text-[var(--text-primary)]">
                  Henüz galeri görseli yok
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-5 text-[var(--text-secondary)]">
                  Kurs merkezinizi daha iyi tanıtmak
                  için fotoğraf ekleyebilirsiniz.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    galleryInputRef.current?.click()
                  }
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[var(--accent-blue)] px-5 py-3 text-sm font-bold text-white"
                >
                  <Plus className="h-4 w-4" />
                  İlk Görseli Ekle
                </button>

              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">

                {displayedGallery.map(
                  (image, index) => (
                    <div
                      key={`${image}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)]"
                    >
                      <img
                        src={image}
                        alt={`${center.centerName} ${index + 1}`}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />

                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                          Kapak
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          removeExistingGalleryImage(
                            image
                          )
                        }
                        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white opacity-100 backdrop-blur transition hover:bg-red-600"
                        title="Görseli kaldır"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )
                )}

                {galleryUploads.map(
                  (upload, index) => (
                    <div
                      key={`${upload.name}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-2xl border-2 border-dashed border-[var(--accent-blue)] bg-[var(--bg-primary)]"
                    >
                      <img
                        src={
                          upload.data
                        }
                        alt={upload.name}
                        className="h-full w-full object-cover"
                      />

                      <div className="absolute bottom-2 left-2 rounded-full bg-[var(--accent-blue)] px-2.5 py-1 text-[10px] font-bold text-white">
                        Yeni
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeNewGalleryImage(
                            index
                          )
                        }
                        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600"
                        title="Yeni görseli kaldır"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )
                )}

                {galleryCount <
                  MAX_GALLERY && (
                  <button
                    type="button"
                    onClick={() =>
                      galleryInputRef.current?.click()
                    }
                    className="flex aspect-square flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] transition hover:border-[var(--accent-blue)] hover:bg-[var(--accent-blue)]/5 hover:text-[var(--accent-blue)]"
                  >
                    <Plus className="mb-2 h-7 w-7" />

                    <span className="text-xs font-bold">
                      Görsel Ekle
                    </span>
                  </button>
                )}

              </div>
            )}

            <input
              ref={galleryInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={
                handleGalleryChange
              }
            />

            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-[var(--bg-primary)] p-4">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-blue)]" />

              <p className="text-xs leading-5 text-[var(--text-secondary)]">
                JPG, PNG veya WEBP kullanın.
                Her görsel maksimum 4 MB olabilir.
                Toplamda en fazla {MAX_GALLERY}{' '}
                görsel ekleyebilirsiniz.
              </p>
            </div>

          </section>


          {/* =================================================
              PUBLICATION
          ================================================= */}

          <section className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-sm sm:p-7">

            <SectionHeader
              icon={
                <ShieldCheck className="h-5 w-5" />
              }
              title="Yayın ve Paket Bilgileri"
              description="Bu bilgiler sistem tarafından yönetilir ve kurs merkezi panelinden değiştirilemez."
            />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <StatusCard
                label="Paket"
                value={
                  center.package || '-'
                }
                icon={
                  <Star className="h-4 w-4" />
                }
                accent="gold"
              />

              <StatusCard
                label="Durum"
                value={
                  center.status || '-'
                }
                icon={
                  <CheckCircle2 className="h-4 w-4" />
                }
                accent="green"
              />

              <StatusCard
                label="Yayın"
                value={
                  center.publishDate ||
                  '-'
                }
                icon={
                  <Info className="h-4 w-4" />
                }
              />

              <StatusCard
                label="Bitiş"
                value={
                  center.endDate ||
                  '-'
                }
                icon={
                  <Info className="h-4 w-4" />
                }
              />

            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--accent-blue)]/10 bg-[var(--accent-blue)]/5 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent-blue)]" />

              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  Güvenli yönetim
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">
                  Paket, ödeme dönemi, yayın süresi,
                  onay durumu ve öne çıkarma gibi
                  sistemsel alanlar yönetim panelinden
                  değiştirilemez.
                </p>
              </div>
            </div>

          </section>


          {/* =================================================
              MANAGEMENT LINK
          ================================================= */}

          <section className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-sm sm:p-7">

            <SectionHeader
              icon={
                <Clipboard className="h-5 w-5" />
              }
              title="Yönetim Bağlantısı"
              description="Bu bağlantı yalnızca kurs merkezinizin bilgilerini yönetmek için kullanılmalıdır."
            />

            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] p-4">

              <div className="flex flex-col gap-3 sm:flex-row">

                <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-4 py-3">
                  <p className="truncate font-mono text-xs text-[var(--text-secondary)]">
                    {managementUrl}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    copyManagementLink
                  }
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent-blue)] px-4 py-3 text-sm font-bold text-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Kopyalandı
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-4 w-4" />
                      Kopyala
                    </>
                  )}
                </button>

              </div>

              <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">
                Bu bağlantıyı kurs merkezinin yetkili
                kişisiyle paylaşın. Bağlantıya sahip olan
                kişi kurs merkezi bilgilerini değiştirebilir.
              </p>

            </div>

          </section>

        </div>


        {/* =================================================
            SAVE BAR
        ================================================= */}

        <div className="sticky bottom-20 z-40 mt-6 sm:bottom-5">

          <div className="rounded-[1.5rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]/95 p-2 shadow-2xl backdrop-blur-xl sm:p-3">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">

              <div className="hidden min-w-0 px-3 sm:block">

                <div className="flex items-center gap-2">

                  {dirty ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-amber-500" />

                      <span className="text-sm font-semibold text-[var(--text-primary)]">
                        Kaydedilmemiş değişiklikleriniz var
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />

                      <span className="text-sm font-medium text-[var(--text-secondary)]">
                        Tüm değişiklikler kaydedildi
                      </span>
                    </>
                  )}

                </div>

              </div>

              <button
                type="button"
                disabled={
                  saving ||
                  !dirty
                }
                onClick={
                  handleSave
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent-blue)] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--accent-blue)]/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[250px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Değişiklikleri Kaydet
                  </>
                )}
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
