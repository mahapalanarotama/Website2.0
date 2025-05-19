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
    this.seedData();
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
    const user: User = { ...insertUser, id };
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
    const member: Member = { 
      ...insertMember, 
      id,
      photoUrl: insertMember.photoUrl || null,
      qrCode: insertMember.qrCode || null,
      email: insertMember.email || null,
      phone: insertMember.phone || null
    };
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
    const activity: Activity = { 
      ...insertActivity, 
      id,
      imageUrl: insertActivity.imageUrl || null
    };
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
    const module: LearningModule = { ...insertModule, id };
    this.learningModules.set(id, module);
    return module;
  }
  
  // Seed method to add initial data
  private seedData() {
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
    
    members.forEach(member => {
      this.createMember(member);
    });
    
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
    ];
    
    activities.forEach(activity => {
      this.createActivity(activity);
    });
    
    // Add sample learning modules
    const learningModules: InsertLearningModule[] = [
      {
        title: 'Navigasi Darat',
        description: 'Panduan lengkap tentang cara membaca peta, menggunakan kompas, dan memahami medan di alam bebas.',
        icon: 'map-marked-alt',
        link: 'https://example.com/navigasi-darat',
      },
      {
        title: 'Teknik Survival',
        description: 'Keterampilan dasar bertahan hidup di alam bebas, termasuk membangun tempat berlindung dan mencari air.',
        icon: 'campground',
        link: 'https://example.com/teknik-survival',
      },
      {
        title: 'Pertolongan Pertama',
        description: 'Panduan penanganan cedera dan situasi darurat saat berada di alam terbuka jauh dari fasilitas medis.',
        icon: 'first-aid',
        link: 'https://example.com/pertolongan-pertama',
      },
    ];
    
    learningModules.forEach(module => {
      this.createLearningModule(module);
    });
  }
}

export const storage = new MemStorage();
