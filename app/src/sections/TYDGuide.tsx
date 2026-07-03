import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Activity } from 'lucide-react';

const tydSteps = [
  {
    step: 1,
    title: 'Çevre Güvenliği',
    description: 'Önce kendi güvenliğinizi ve olay yerinin güvenliğini sağlayın. Elektrik, yangın veya trafik gibi tehlikeler varsa önce bunları ortadan kaldırın. Güvenli bir alan oluşturun.',
    duration: null,
    color: 'bg-[var(--accent-amber-light)] text-[var(--accent-amber)]',
  },
  {
    step: 2,
    title: 'Bilinç Kontrolü',
    description: 'Hastanın omzunu hafifçe sarsın ve seslenin: "İyi misiniz?" Herhangi bir yanıt yoksa bilinç kapalıdır. Eğer hastada bilinç yoksa hemen 112\'yi arayın.',
    duration: null,
    color: 'bg-[var(--accent-amber-light)] text-[var(--accent-amber)]',
  },
  {
    step: 3,
    title: '112 Ara + OED Getir',
    description: 'Hemen 112\'yi arayın ve yardım isteyin. Etrafınızda birini OED (Otomatik Eksternal Defibrilatör) getirmesi için gönderin. Kamu alanlarında OED kutuları duvarlarda kırmızı kutular halindedir. Sağlık Bakanlığı tarafından yerleştirilen OED\'ler kapak açıldığında alarm çalarak çevredekileri uyarır.',
    duration: null,
    color: 'bg-[var(--accent-red-light)] text-[var(--accent-red)]',
  },
  {
    step: 4,
    title: 'Ağız İçi Kontrolü',
    description: 'Hastanın başını geriye atın (çene kaldırma). Ağız içinde yabancı cisim varsa parmakla temizleyin. Dilin geride kalmasını önleyin. Solunum yolunu açın.',
    duration: null,
    color: 'bg-[var(--accent-amber-light)] text-[var(--accent-amber)]',
  },
  {
    step: 5,
    title: 'Solunum Kontrolü',
    description: 'Kulağınızı hastanın ağzına yaklaştırın. 10 saniye içinde normal solunum olup olmadığını kontrol edin. Göğüs hareketini gözlemleyin. Solunum yoksa hemen temel yaşam desteğine başlayın.',
    duration: '10 saniye',
    color: 'bg-[var(--accent-blue-light)] text-[var(--accent-blue)]',
  },
  {
    step: 6,
    title: '30 Kalp Masajı (Bası)',
    description: 'Göğüs kemiğinin ortasına iki elin avuç içini üst üste koyun. Kollar düz, vücudun ağırlığını kullanarak göğüs duvarını 5-6 cm derinlikte bastırın. Ritim: Dakikada 100-120 bası. Göğüs tamamen geri sıçramalıdır.',
    duration: '30 bası',
    color: 'bg-[var(--accent-green-light)] text-[var(--accent-green)]',
  },
  {
    step: 7,
    title: '2 Nefes (Soluk)',
    description: 'Hastanın burnunu kapatıp ağzını tamamen kaplayarak 1 saniyede 2 nefes verin. Her nefeste göğüs hafifçe kalkmalıdır. Nefes veremiyorsanız masaja devam edin.',
    duration: '2 nefes',
    color: 'bg-[var(--accent-green-light)] text-[var(--accent-green)]',
  },
  {
    step: 8,
    title: 'OED Bağla',
    description: 'OED geldiyse cihazı açın, sesli yönergeleri izleyin. Pedleri göğüse yapıştırın ve cihazın şok yapmasını bekleyin. Şok uygulandıktan hemen sonra CPR\'ye (30 bası + 2 nefes) devam edin. Profesyonel yardım gelene kadar durmayın!',
    duration: null,
    color: 'bg-[var(--accent-red-light)] text-[var(--accent-red)]',
  },
];

export function TYDGuide() {
  const [isOpen, setIsOpen] = useState(false);
  const [openStep, setOpenStep] = useState<number | null>(null);

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-[var(--bg-card)] px-4 sm:px-6 border-y border-[var(--border-subtle)]">
      <div className="max-w-[1200px] mx-auto">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-5 rounded-2xl bg-[var(--bg-primary)] dark:bg-[#0D0F18] shadow-md hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-red-light)] flex items-center justify-center">
              <Activity className="w-6 h-6 text-[var(--accent-red)]" />
            </div>
            <div className="text-left">
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">
                Temel Yaşam Desteği (TYD) Rehberi
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                Acil durumda yapmanız gereken 8 adım
              </p>
            </div>
          </div>
          {isOpen ? (
            <ChevronUp className="w-6 h-6 text-[var(--text-muted)] flex-shrink-0" />
          ) : (
            <ChevronDown className="w-6 h-6 text-[var(--text-muted)] flex-shrink-0" />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-3">
                {tydSteps.map((item) => (
                  <div key={item.step} className="rounded-xl border border-[var(--border)] overflow-hidden">
                    <button
                      onClick={() => setOpenStep(openStep === item.step ? null : item.step)}
                      className="w-full flex items-center gap-4 p-4 hover:bg-[var(--bg-primary)] dark:hover:bg-[#0D0F18] transition-colors"
                    >
                      <span className={`w-8 h-8 rounded-full ${item.color} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                        {item.step}
                      </span>
                      <div className="flex-1 text-left">
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">{item.title}</h3>
                      </div>
                      {item.duration && (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--accent-blue-light)] text-[var(--accent-blue)] flex-shrink-0">
                          {item.duration}
                        </span>
                      )}
                      {openStep === item.step ? (
                        <ChevronUp className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0" />
                      )}
                    </button>

                    <AnimatePresence>
                      {openStep === item.step && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 pl-16">
                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <div className="p-4 rounded-xl bg-[var(--accent-red-light)]">
                  <p className="text-sm font-medium text-[var(--accent-red)]">
                    Unutmayın: 30 baskı + 2 nefes döngüsünü profesyonel yardım gelene kadar sürdürün!
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
