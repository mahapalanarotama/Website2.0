// Database lokal frontend untuk modul pembelajaran (Learning Module)
export interface LearningModuleFront {
  id: number;
  title: string;
  description: string;
  icon: string;
  link: string;
}

export const learningModulesFront: LearningModuleFront[] = [
  {
    id: 1,
    title: 'Dasar-dasar Navigasi Darat',
    description: 'Panduan lengkap membaca peta, kompas, dan teknik orientasi di alam bebas.',
    icon: 'map-marked-alt',
    link: 'https://www.mapalapendaki.com/2017/01/panduan-navigasi-darat.html',
  },
  {
    id: 2,
    title: 'Teknik Survival Hutan',
    description: 'Tips dan teknik bertahan hidup di hutan untuk pendaki dan pecinta alam.',
    icon: 'campground',
    link: 'https://www.pendaki.id/2018/07/teknik-survival-hutan.html',
  },
  {
    id: 3,
    title: 'Pertolongan Pertama di Alam',
    description: 'Langkah-langkah P3K untuk kecelakaan di alam terbuka.',
    icon: 'first-aid',
    link: 'https://www.kompasiana.com/pendakicerdas/pertolongan-pertama-di-alam-terbuka',
  },
  {
    id: 4,
    title: 'Manajemen Logistik Pendakian',
    description: 'Cara mengatur logistik dan perbekalan untuk ekspedisi gunung.',
    icon: 'box',
    link: 'https://www.gunung.id/2019/03/manajemen-logistik-pendakian.html',
  },
  {
    id: 5,
    title: 'Teknik Membuat Shelter',
    description: 'Tutorial membuat bivak dan shelter darurat di alam.',
    icon: 'home',
    link: 'https://www.pendaki.id/2017/09/cara-membuat-bivak.html',
  },
  {
    id: 6,
    title: 'Penggunaan GPS untuk Pendaki',
    description: 'Cara menggunakan GPS dan aplikasi navigasi digital.',
    icon: 'satellite',
    link: 'https://www.mapalapendaki.com/2018/05/gps-untuk-pendaki.html',
  },
  {
    id: 7,
    title: 'Teknik Panjat Tebing Dasar',
    description: 'Dasar-dasar teknik panjat tebing untuk pemula.',
    icon: 'mountain',
    link: 'https://www.kompasiana.com/tebing/teknik-panjat-tebing-dasar',
  },
  {
    id: 8,
    title: 'Etika Lingkungan Pecinta Alam',
    description: 'Kode etik dan prinsip Leave No Trace untuk kegiatan outdoor.',
    icon: 'leaf',
    link: 'https://www.leavenotrace.or.id/7-prinsip-leave-no-trace/',
  },
  {
    id: 9,
    title: 'Teknik Rescue Air',
    description: 'Teknik penyelamatan di sungai dan perairan terbuka.',
    icon: 'life-ring',
    link: 'https://www.pendaki.id/2018/08/teknik-rescue-air.html',
  },
  {
    id: 10,
    title: 'Manajemen Risiko Kegiatan Alam',
    description: 'Identifikasi dan mitigasi risiko dalam kegiatan alam bebas.',
    icon: 'exclamation-triangle',
    link: 'https://www.gunung.id/2018/11/manajemen-risiko-pendakian.html',
  },
  // ...tambahkan data lain sesuai kebutuhan
];
