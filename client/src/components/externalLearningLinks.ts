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
  }
];
// Data dummy learning dihapus, gunakan Firestore untuk data pembelajaran.
