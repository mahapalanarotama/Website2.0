import { users, User, InsertUser, Member, InsertMember, Activity, InsertActivity, LearningModule, InsertLearningModule } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Member methods
  getAllMembers(): Promise<Member[]>;
  getMemberById(id: number): Promise<Member | undefined>;
  getMemberByRegistrationNumber(registrationNumber: string): Promise<Member | undefined>;
  createMember(member: InsertMember): Promise<Member>;
  
  // Activity methods
  getAllActivities(): Promise<Activity[]>;
  getActivityById(id: number): Promise<Activity | undefined>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Learning module methods
  getAllLearningModules(): Promise<LearningModule[]>;
  getLearningModuleById(id: number): Promise<LearningModule | undefined>;
  createLearningModule(module: InsertLearningModule): Promise<LearningModule>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private members: Map<number, Member>;
  private activities: Map<number, Activity>;
  private learningModules: Map<number, LearningModule>;
  private userId: number;
  private memberId: number;
  private activityId: number;
  private moduleId: number;

  constructor() {
    this.users = new Map();
    this.members = new Map();
    this.activities = new Map();
    this.learningModules = new Map();
    this.userId = 1;
    this.memberId = 1;
    this.activityId = 1;
    this.moduleId = 1;
    
    // Add some initial data for testing
    // NOTE: seedData is now async, so we must handle it properly
    // this.seedData(); // Hapus pemanggilan seedData dari constructor
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    // Type assertion to help TypeScript recognize the fields
    const user: User = { id, ...(insertUser as { username: string; password: string }) };
    this.users.set(id, user);
    return user;
  }
  
  // Member methods
  async getAllMembers(): Promise<Member[]> {
    return Array.from(this.members.values());
  }
  
  async getMemberById(id: number): Promise<Member | undefined> {
    return this.members.get(id);
  }
  
  async getMemberByRegistrationNumber(registrationNumber: string): Promise<Member | undefined> {
    return Array.from(this.members.values()).find(
      (member) => member.registrationNumber === registrationNumber,
    );
  }
  
  async createMember(insertMember: InsertMember): Promise<Member> {
    const id = this.memberId++;
    const member: Member = { id, ...(insertMember as Member) };
    this.members.set(id, member);
    return member;
  }
  
  // Activity methods
  async getAllActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values());
  }
  
  async getActivityById(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }
  
  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const activity: Activity = { id, ...(insertActivity as Activity) };
    this.activities.set(id, activity);
    return activity;
  }
  
  // Learning module methods
  async getAllLearningModules(): Promise<LearningModule[]> {
    return Array.from(this.learningModules.values());
  }
  
  async getLearningModuleById(id: number): Promise<LearningModule | undefined> {
    return this.learningModules.get(id);
  }
  
  async createLearningModule(insertModule: InsertLearningModule): Promise<LearningModule> {
    const id = this.moduleId++;
    const module: LearningModule = { id, ...(insertModule as LearningModule) };
    this.learningModules.set(id, module);
    return module;
  }
  
  // Seed method to add initial data
  public async seedData() {
    // Add sample members
    const members: InsertMember[] = [
      {
        fullName: 'Ahmad Rizki',
        fieldName: 'Rizki',
        batchName: 'Elang',
        batchYear: 2020,
        registrationNumber: 'MPN-2020-001',
        membershipStatus: 'Aktif',
        photoUrl: '',
        qrCode: '',
        email: 'ahmad.rizki@example.com',
        phone: '081234567890',
      },
      {
        fullName: 'Dewi Sartika',
        fieldName: 'Dewi',
        batchName: 'Garuda',
        batchYear: 2021,
        registrationNumber: 'MPN-2021-015',
        membershipStatus: 'Aktif',
        photoUrl: '',
        qrCode: '',
        email: 'dewi.sartika@example.com',
        phone: '081234567891',
      },
      {
        fullName: 'Budi Santoso',
        fieldName: 'Budi',
        batchName: 'Elang',
        batchYear: 2020,
        registrationNumber: 'MPN-2020-002',
        membershipStatus: 'Tidak Aktif',
        photoUrl: '',
        qrCode: '',
        email: 'budi.santoso@example.com',
        phone: '081234567892',
      },
    ];
    for (const member of members) {
      await this.createMember(member);
    }
    // Add sample activities
    const activities: InsertActivity[] = [
      {
        title: 'Ekspedisi Gunung Semeru',
        description: 'Pendakian Gunung Semeru bersama 15 anggota aktif Mahapala Narotama dengan misi penelitian flora endemik.',
        date: new Date('2023-04-23'),
        imageUrl: 'https://images.unsplash.com/photo-1551632811-561732d1e306',
        category: 'Ekspedisi',
      },
      {
        title: 'Program Penanaman Pohon',
        description: 'Kegiatan penanaman 500 bibit pohon di kawasan hutan Trawas, Mojokerto sebagai bagian dari kampanye penghijauan.',
        date: new Date('2023-06-05'),
        imageUrl: 'https://images.unsplash.com/photo-1513828583688-c52646db42da',
        category: 'Konservasi',
      },
      {
        title: 'Sosialisasi Bahaya Sampah Plastik',
        description: 'Kegiatan edukasi tentang bahaya sampah plastik bagi lingkungan kepada siswa SD di Surabaya.',
        date: new Date('2023-05-12'),
        imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205',
        category: 'Edukasi',
      },
      {
        title: 'Pelatihan Navigasi Darat',
        description: 'Pelatihan membaca peta dan penggunaan kompas di kawasan Coban Rondo.',
        date: new Date('2023-07-10'),
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        category: 'Pelatihan',
      },
      {
        title: 'Ekspedisi Goa Jomblang',
        description: 'Eksplorasi dan pemetaan Goa Jomblang oleh tim Mahapala.',
        date: new Date('2023-08-15'),
        imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
        category: 'Ekspedisi',
      },
      {
        title: 'Bakti Sosial di Lereng Bromo',
        description: 'Distribusi bantuan logistik dan edukasi lingkungan untuk warga sekitar Bromo.',
        date: new Date('2023-09-05'),
        imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
        category: 'Sosial',
      },
      {
        title: 'Pelatihan Pertolongan Pertama',
        description: 'Workshop P3K untuk anggota baru di basecamp Mahapala.',
        date: new Date('2023-10-01'),
        imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
        category: 'Pelatihan',
      },
      {
        title: 'Pendakian Gunung Lawu',
        description: 'Pendakian bersama anggota dan alumni ke Gunung Lawu.',
        date: new Date('2023-11-12'),
        imageUrl: 'https://images.unsplash.com/photo-1464013778555-8e723c2f01f8',
        category: 'Ekspedisi',
      },
      {
        title: 'Kegiatan Bersih Pantai Kenjeran',
        description: 'Aksi bersih-bersih pantai dan edukasi pengunjung tentang sampah plastik.',
        date: new Date('2023-12-03'),
        imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9',
        category: 'Konservasi',
      },
      {
        title: 'Pelatihan Vertical Rescue',
        description: 'Simulasi penyelamatan di tebing oleh tim rescue Mahapala.',
        date: new Date('2024-01-20'),
        imageUrl: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99',
        category: 'Pelatihan',
      },
      {
        title: 'Ekspedisi Sungai Brantas',
        description: 'Penelusuran dan pemetaan Sungai Brantas untuk penelitian ekosistem.',
        date: new Date('2024-02-14'),
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        category: 'Ekspedisi',
      },
      {
        title: 'Pelatihan Survival Dasar',
        description: 'Pelatihan bertahan hidup di alam liar di kawasan Pacet.',
        date: new Date('2024-03-09'),
        imageUrl: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
        category: 'Pelatihan',
      },
      {
        title: 'Kegiatan Penanaman Mangrove',
        description: 'Penanaman bibit mangrove di pesisir Surabaya untuk mencegah abrasi.',
        date: new Date('2024-04-21'),
        imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
        category: 'Konservasi',
      },
      {
        title: 'Pelatihan Mountaineering',
        description: 'Pelatihan teknik mendaki gunung dan penggunaan alat mountaineering.',
        date: new Date('2024-05-18'),
        imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        category: 'Pelatihan',
      },
      {
        title: 'Ekspedisi Gunung Rinjani',
        description: 'Pendakian dan penelitian ekosistem Gunung Rinjani.',
        date: new Date('2024-06-10'),
        imageUrl: 'https://images.unsplash.com/photo-1464013778555-8e723c2f01f8',
        category: 'Ekspedisi',
      },
      {
        title: 'Pelatihan Manajemen Risiko',
        description: 'Workshop manajemen risiko dalam kegiatan alam bebas.',
        date: new Date('2024-07-07'),
        imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429',
        category: 'Pelatihan',
      },
      {
        title: 'Kegiatan Donor Darah',
        description: 'Aksi donor darah bersama PMI di kampus.',
        date: new Date('2024-08-15'),
        imageUrl: 'https://images.unsplash.com/photo-1513828583688-c52646db42da',
        category: 'Sosial',
      },
      {
        title: 'Pelatihan SAR',
        description: 'Pelatihan Search and Rescue untuk anggota baru.',
        date: new Date('2024-09-12'),
        imageUrl: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99',
        category: 'Pelatihan',
      },
      {
        title: 'Ekspedisi Pulau Sempu',
        description: 'Eksplorasi dan penelitian flora-fauna di Pulau Sempu.',
        date: new Date('2024-10-05'),
        imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
        category: 'Ekspedisi',
      },
      {
        title: 'Pelatihan Rope Access',
        description: 'Pelatihan teknik rope access untuk kegiatan panjat tebing.',
        date: new Date('2024-11-02'),
        imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
        category: 'Pelatihan',
      },
      {
        title: 'Kegiatan Bersih Gunung',
        description: 'Aksi bersih-bersih jalur pendakian Gunung Arjuno.',
        date: new Date('2024-12-14'),
        imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205',
        category: 'Konservasi',
      },
      {
        title: 'Pelatihan Water Rescue',
        description: 'Pelatihan penyelamatan di perairan untuk anggota Mahapala.',
        date: new Date('2025-01-18'),
        imageUrl: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9',
        category: 'Pelatihan',
      },
    ];
    for (const activity of activities) {
      await this.createActivity(activity);
    }
    // Add sample learning modules
    const learningModules: InsertLearningModule[] = [
      {
        title: 'Dasar-dasar Navigasi Darat',
        description: 'Panduan lengkap membaca peta, kompas, dan teknik orientasi di alam bebas.',
        icon: 'map-marked-alt',
        link: 'https://www.mapalapendaki.com/2017/01/panduan-navigasi-darat.html',
      },
      {
        title: 'Teknik Survival Hutan',
        description: 'Tips dan teknik bertahan hidup di hutan untuk pendaki dan pecinta alam.',
        icon: 'campground',
        link: 'https://www.pendaki.id/2018/07/teknik-survival-hutan.html',
      },
      {
        title: 'Pertolongan Pertama di Alam',
        description: 'Langkah-langkah P3K untuk kecelakaan di alam terbuka.',
        icon: 'first-aid',
        link: 'https://www.kompasiana.com/pendakicerdas/pertolongan-pertama-di-alam-terbuka',
      },
      {
        title: 'Manajemen Logistik Pendakian',
        description: 'Cara mengatur logistik dan perbekalan untuk ekspedisi gunung.',
        icon: 'box',
        link: 'https://www.gunung.id/2019/03/manajemen-logistik-pendakian.html',
      },
      {
        title: 'Teknik Membuat Shelter',
        description: 'Tutorial membuat bivak dan shelter darurat di alam.',
        icon: 'home',
        link: 'https://www.pendaki.id/2017/09/cara-membuat-bivak.html',
      },
      {
        title: 'Penggunaan GPS untuk Pendaki',
        description: 'Cara menggunakan GPS dan aplikasi navigasi digital.',
        icon: 'satellite',
        link: 'https://www.mapalapendaki.com/2018/05/gps-untuk-pendaki.html',
      },
      {
        title: 'Teknik Panjat Tebing Dasar',
        description: 'Dasar-dasar teknik panjat tebing untuk pemula.',
        icon: 'mountain',
        link: 'https://www.kompasiana.com/tebing/teknik-panjat-tebing-dasar',
      },
      {
        title: 'Etika Lingkungan Pecinta Alam',
        description: 'Kode etik dan prinsip Leave No Trace untuk kegiatan outdoor.',
        icon: 'leaf',
        link: 'https://www.leavenotrace.or.id/7-prinsip-leave-no-trace/',
      },
      {
        title: 'Teknik Rescue Air',
        description: 'Teknik penyelamatan di sungai dan perairan terbuka.',
        icon: 'life-ring',
        link: 'https://www.pendaki.id/2018/08/teknik-rescue-air.html',
      },
      {
        title: 'Manajemen Risiko Kegiatan Alam',
        description: 'Identifikasi dan mitigasi risiko dalam kegiatan alam bebas.',
        icon: 'exclamation-triangle',
        link: 'https://www.gunung.id/2018/11/manajemen-risiko-pendakian.html',
      },
      {
        title: 'Teknik Packing Carrier',
        description: 'Cara packing carrier yang efisien dan aman.',
        icon: 'suitcase',
        link: 'https://www.pendaki.id/2017/10/cara-packing-carrier.html',
      },
      {
        title: 'Survival di Gunung Bersalju',
        description: 'Tips bertahan hidup di gunung bersalju dan cuaca ekstrem.',
        icon: 'snowflake',
        link: 'https://www.pendaki.id/2019/01/survival-di-gunung-bersalju.html',
      },
      {
        title: 'Teknik Membaca Cuaca',
        description: 'Cara membaca tanda-tanda cuaca di alam bebas.',
        icon: 'cloud-sun',
        link: 'https://www.gunung.id/2018/02/membaca-cuaca-di-gunung.html',
      },
      {
        title: 'Pertolongan Pertama Gigitan Ular',
        description: 'Penanganan gigitan ular di alam terbuka.',
        icon: 'medkit',
        link: 'https://www.pendaki.id/2018/09/pertolongan-pertama-gigitan-ular.html',
      },
      {
        title: 'Teknik Rappelling',
        description: 'Dasar-dasar teknik turun tebing dengan tali (rappelling).',
        icon: 'arrow-down',
        link: 'https://www.kompasiana.com/tebing/teknik-rappelling',
      },
      {
        title: 'Manajemen Sampah di Alam',
        description: 'Strategi pengelolaan sampah saat ekspedisi.',
        icon: 'trash',
        link: 'https://www.gunung.id/2017/12/manajemen-sampah-di-gunung.html',
      },
      {
        title: 'Teknik Masak di Gunung',
        description: 'Tips memasak praktis dan hemat bahan bakar di gunung.',
        icon: 'utensils',
        link: 'https://www.pendaki.id/2017/11/teknik-masak-di-gunung.html',
      },
      {
        title: 'Pengenalan Flora dan Fauna',
        description: 'Panduan mengenal flora dan fauna khas pegunungan Indonesia.',
        icon: 'leaf',
        link: 'https://www.mapalapendaki.com/2018/06/flora-fauna-pegunungan.html',
      },
      {
        title: 'Teknik Crossing Sungai',
        description: 'Cara aman menyeberangi sungai saat ekspedisi.',
        icon: 'water',
        link: 'https://www.pendaki.id/2018/10/teknik-crossing-sungai.html',
      },
      {
        title: 'P3K Cedera Lutut & Kaki',
        description: 'Penanganan cedera lutut dan kaki saat pendakian.',
        icon: 'first-aid',
        link: 'https://www.kompasiana.com/pendakicerdas/p3k-cedera-lutut-kaki',
      },
      {
        title: 'Teknik Survival di Pantai',
        description: 'Tips bertahan hidup di pantai dan pesisir.',
        icon: 'umbrella-beach',
        link: 'https://www.pendaki.id/2019/02/survival-di-pantai.html',
      },
      {
        title: 'Manajemen Waktu Pendakian',
        description: 'Cara mengatur waktu dan jadwal selama ekspedisi gunung.',
        icon: 'clock',
        link: 'https://www.gunung.id/2019/04/manajemen-waktu-pendakian.html',
      },
      {
        title: 'Teknik Membaca Jejak Satwa',
        description: 'Panduan identifikasi jejak satwa liar di hutan.',
        icon: 'paw',
        link: 'https://www.mapalapendaki.com/2019/03/membaca-jejak-satwa.html',
      },
      {
        title: 'Pengenalan Peralatan Outdoor',
        description: 'Review dan tips memilih peralatan outdoor untuk pemula.',
        icon: 'toolbox',
        link: 'https://www.pendaki.id/2018/03/peralatan-outdoor-pendaki.html',
      },
      {
        title: 'Teknik Survival di Gurun',
        description: 'Tips bertahan hidup di lingkungan kering dan panas.',
        icon: 'sun',
        link: 'https://www.pendaki.id/2019/03/survival-di-gurun.html',
      },
      {
        title: 'Teknik Membaca Peta Topografi',
        description: 'Cara membaca dan memahami peta topografi.',
        icon: 'map',
        link: 'https://www.gunung.id/2018/07/membaca-peta-topografi.html',
      },
      {
        title: 'Teknik Survival di Hutan Hujan',
        description: 'Strategi bertahan hidup di hutan hujan tropis.',
        icon: 'cloud-rain',
        link: 'https://www.pendaki.id/2019/04/survival-hutan-hujan.html',
      },
      {
        title: 'Teknik Membuat Api',
        description: 'Cara membuat api unggun di alam bebas.',
        icon: 'fire',
        link: 'https://www.pendaki.id/2017/12/cara-membuat-api-unggul.html',
      },
      {
        title: 'Teknik Survival di Pegunungan',
        description: 'Tips bertahan hidup di pegunungan tinggi.',
        icon: 'mountain',
        link: 'https://www.pendaki.id/2019/05/survival-di-pegunungan.html',
      },
      {
        title: 'Teknik Membaca Kompas',
        description: 'Panduan lengkap membaca dan menggunakan kompas.',
        icon: 'compass',
        link: 'https://www.mapalapendaki.com/2017/02/cara-menggunakan-kompas.html',
      },
      {
        title: 'Teknik Survival di Gua',
        description: 'Tips bertahan hidup saat eksplorasi gua.',
        icon: 'cave',
        link: 'https://www.pendaki.id/2019/06/survival-di-gua.html',
      },
      {
        title: 'Teknik Survival di Danau',
        description: 'Strategi bertahan hidup di sekitar danau.',
        icon: 'water',
        link: 'https://www.pendaki.id/2019/07/survival-di-danau.html',
      },
      {
        title: 'Teknik Survival di Pulau',
        description: 'Tips bertahan hidup di pulau terpencil.',
        icon: 'island-tropical',
        link: 'https://www.pendaki.id/2019/08/survival-di-pulau.html',
      },
      {
        title: 'Teknik Survival di Salju',
        description: 'Tips bertahan hidup di lingkungan bersalju.',
        icon: 'snowflake',
        link: 'https://www.pendaki.id/2019/09/survival-di-salju.html',
      },
      {
        title: 'Teknik Survival di Gunung Api',
        description: 'Strategi bertahan hidup di sekitar gunung api.',
        icon: 'volcano',
        link: 'https://www.pendaki.id/2019/10/survival-di-gunung-api.html',
      },
    ];
    for (const module of learningModules) {
      await this.createLearningModule(module);
    }
  }
}

export const storage = new MemStorage();
