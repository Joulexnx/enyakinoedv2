export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <a
          href="/"
          className="mb-8 inline-block text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          ← En Yakın OED'ye Dön
        </a>

        <h1 className="mb-3 text-4xl font-bold text-[var(--text-primary)]">
          Gizlilik Politikası
        </h1>

        <p className="mb-10 text-sm text-[var(--text-muted)]">
          Son güncelleme: 1 Ekim 2026
        </p>

        <div className="space-y-8 leading-7 text-[var(--text-secondary)]">
          <section>
            <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">
              1. Genel
            </h2>
            <p>
              En Yakın OED, kullanıcıların kendilerine en yakın Otomatik
              Eksternal Defibrilatör (OED) cihazlarını bulmasına yardımcı olmak
              amacıyla geliştirilmiştir.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">
              2. Toplanan ve İşlenen Bilgiler
            </h2>
            <p>
              Uygulama, OED cihazlarına olan mesafeyi hesaplayabilmek amacıyla
              cihazın konum bilgisini kullanır.
            </p>
            <p className="mt-3">
              Konum bilgisi yalnızca OED cihazlarının kullanıcıya olan
              mesafesini hesaplamak amacıyla kullanılır. Mevcut uygulama
              işleyişine göre konum bilgisi sunucularımıza kaydedilmez ve
              üçüncü taraflarla paylaşılmaz.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">
              3. Konum Verileri
            </h2>
            <p>
              En Yakın OED, kullanıcının cihaz konumunu yakındaki OED
              cihazlarını belirlemek ve mesafe hesaplamak amacıyla kullanır.
              Konum verisi uygulamanın mevcut işleyişi kapsamında cihaz
              üzerinde işlenir.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">
              4. Çerezler ve Yerel Depolama
            </h2>
            <p>
              Uygulama, bazı kullanıcı tercihlerini ve uygulama ayarlarını
              cihazın yerel depolama alanında (localStorage) saklayabilir.
              Bu bilgiler kullanıcının cihazında tutulur.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">
              5. Verilerin Paylaşılması
            </h2>
            <p>
              En Yakın OED, kullanıcı konum bilgisini reklam, pazarlama veya
              veri satışı amacıyla üçüncü taraflarla paylaşmaz.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">
              6. Veri Saklama ve Silme
            </h2>
            <p>
              Konum bilgisi sunucularımızda saklanmadığından, sunucularımızda
              konum verisine ilişkin kullanıcı kaydı tutulmaz.
            </p>
            <p className="mt-3">
              Cihaz üzerinde yerel olarak tutulan uygulama tercihleri,
              uygulama verilerinin cihaz ayarlarından temizlenmesi veya
              uygulamanın kaldırılmasıyla silinebilir.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">
              7. Güvenlik
            </h2>
            <p>
              Kullanıcı verilerinin korunması amacıyla uygun teknik ve idari
              güvenlik önlemlerinin uygulanması hedeflenmektedir.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">
              8. Çocukların Gizliliği
            </h2>
            <p>
              En Yakın OED belirli bir yaş grubuna yönelik olarak
              tasarlanmamıştır. Uygulama, çocuklardan bilerek kişisel bilgi
              toplamak amacıyla geliştirilmemiştir.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">
              9. Politika Değişiklikleri
            </h2>
            <p>
              Bu gizlilik politikası, uygulamanın özelliklerinde veya veri
              işleme yöntemlerinde meydana gelebilecek değişikliklere bağlı
              olarak güncellenebilir. Güncel politika bu sayfada yayımlanır.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-xl font-semibold text-[var(--text-primary)]">
              10. İletişim
            </h2>
            <p>
              Gizlilik politikası veya kişisel verilerin işlenmesi hakkında
              sorularınız için aşağıdaki e-posta adresinden bizimle
              iletişime geçebilirsiniz:
            </p>

            <p className="mt-3">
              <a
                href="mailto:alperoyanik@gmail.com"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                alperoyanik@gmail.com
              </a>
            </p>
          </section>
        </div>

        <div className="mt-12 border-t border-[var(--border-subtle)] pt-6 text-sm text-[var(--text-muted)]">
          © 2026 En Yakın OED — Hayat kurtarmak için geliştirildi
        </div>
      </div>
    </div>
  );
}