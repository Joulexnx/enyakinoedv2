import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, BookOpen, Phone, ChevronDown, ChevronUp } from 'lucide-react';

const infoCards = [
  {
    icon: <HeartPulse className="w-7 h-7 text-[#DC2626]" />,
    iconBg: 'bg-[#FEE2E2] dark:bg-[rgba(239,68,68,0.15)]',
    image: './oed-device.jpg',
    title: 'OED Nedir?',
    shortText: 'Otomatik Eksternal Defibrilatör (OED), ani kalp durması durumunda kalbi elektrik şoku ile normale döndüren taşınabilir bir cihazdır.',
    fullContent: [
      'Otomatik Eksternal Defibrilatör (OED), ani kalp durması durumunda kalbi elektrik şoku ile normale döndüren taşınabilir bir cihazdır.',
      'OED cihazları kalbin düzensiz atmaya başladığı durumlarda (ventriküler fibrilasyon) kalbe kontrollü bir elektrik şoku uygulayarak kalbin normal ritmine dönmesini sağlar.',
      'Cihaz tamamen otomatiktir. Kullanıcı herhangi bir tıbbi bilgiye sahip olmasa bile, cihazın sesli ve görsel yönergelerini takip ederek kolayca kullanabilir.',
      'Her yıl Türkiye\'de binlerce insan ani kalp durması nedeniyle hayatını kaybetmektedir. OED kullanımı ile bu ölümlerin büyük bir kısmı önlenebilir.',
      'OED cihazları artık havaalanları, alışveriş merkezleri, spor salonları, okullar ve parklar gibi kamu alanlarında yaygın olarak bulunmaktadır. Türkiye\'de Sağlık Bakanlığı tarafından yerleştirilen OED\'ler yukarıdaki görseldeki gibi kırmızı kutular içindedir.',
    ],
  },
  {
    icon: <BookOpen className="w-7 h-7 text-[#2563EB]" />,
    iconBg: 'bg-[#DBEAFE] dark:bg-[rgba(59,130,246,0.15)]',
    image: './tyd-training.jpg',
    title: 'Nasıl Kullanılır?',
    shortText: 'OED cihazları sesli ve görsel talimatlarla yönlendirme yapar. Cihazı açın, pedleri göğüse yerleştirin ve cihazın yönergelerini izleyin.',
    fullContent: [
      '1. Cihazı Açın: OED kutusunun kapağını açın veya üzerindeki açma düğmesine basın. Cihaz otomatik olarak açılacak ve sesli talimatlar vermeye başlayacaktır.',
      '2. Pedleri Yerleştirin: Cihazın üzerindeki görsel şekle bakarak pedleri göğüs bölgesine yapışkan tarafıyla yapıştırın. Bir ped sağ göğsün üst kısmına, diğeri sol göğsün alt kısmına yerleştirilir.',
      '3. Analiz Etmesini Bekleyin: OED otomatik olarak kalp ritmini analiz eder. Bu sırada kimse hastaya dokunmamalıdır. Cihaz şok gerekip gerekmediğini belirler.',
      '4. Şok Gerekirse: Cihaz şok yapılması gerektiğinde "ŞOK" düğmesine basın uyarısını verir. Otomatik OED\'lerde şok cihaz tarafından otomatik verilir.',
      '5. CPR Devam Edin: Şoku uyguladıktan sonra cihaz size kalp masajı ve suni solunum yapmaya devam etmeniz gerektiğini söyleyecektir.',
      '6. 112\'yi Arayın: OED kullanırken mutlaka 112\'yi arayın. Profesyonel yardım gelene kadar cihazın talimatlarını izlemeye devam edin.',
    ],
  },
  {
    icon: <Phone className="w-7 h-7 text-[#059669]" />,
    iconBg: 'bg-[#D1FAE5] dark:bg-[rgba(16,185,129,0.15)]',
    image: null,
    title: 'Önce 112\'yi Arayın',
    shortText: 'Acil durumda ilk adım her zaman 112\'yi aramaktır. Operatör size OED kullanımı ve temel yaşam desteği konusunda rehberlik edecektir.',
    fullContent: [
      'Acil durumda ilk adım her zaman 112\'yi aramaktır. Operatör size OED kullanımı ve temel yaşam desteği konusunda rehberlik edecektir.',
      '112 aradığınızda operatöre şu bilgileri verin:',
      '- Olay yerinin tam adresi',
      '- Hastanın bilinç durumu',
      '- Hastanın solunum durumu',
      '- OED cihazının bulunduğu yer (varsa)',
      '- Varsa diğer kişilerden yardım alınıp alınmadığı',
      '112 operatörü size telefon üzerinden kalp masajı ve OED kullanımı konusunda rehberlik edebilir. Telefonu açık tutun ve operatörün talimatlarını dikkatlice dinleyin.',
    ],
  },
];

function InfoCard({ card, index }: { card: typeof infoCards[0]; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="bg-white dark:bg-[var(--bg-card)] rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-250"
    >
      {card.image && (
        <div className="w-full h-44 overflow-hidden">
          <img src={card.image} alt={card.title} className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}

      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${card.iconBg} flex items-center justify-center flex-shrink-0`}>
            {card.icon}
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{card.title}</h3>
        </div>

        <p className="mt-3 text-sm text-[var(--text-secondary)] leading-relaxed">
          {card.shortText}
        </p>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[var(--accent-blue)] hover:underline"
        >
          {isOpen ? <><ChevronUp className="w-4 h-4" />Daha az göster</> : <><ChevronDown className="w-4 h-4" />Daha fazla bilgi</>}
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="overflow-hidden"
            >
              <div className="pt-4 mt-4 border-t border-[var(--border-subtle)] space-y-3">
                {card.fullContent.map((paragraph, i) => (
                  <p key={i} className="text-sm text-[var(--text-secondary)] leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export function InformationPanel() {
  return (
    <section className="py-12 sm:py-16 bg-[var(--bg-primary)] px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            Bilgi Merkezi
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            OED hakkında bilmeniz gerekenler
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {infoCards.map((card, index) => (
            <InfoCard key={card.title} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
