// AcademyManager Type Definitions

export interface Student {
  id: string;
  // Dados Pessoais
  name: string;
  birthDate: string; // YYYY-MM-DD
  cpf: string;
  photo: string; // URL ou base64
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  
  // Dados do Responsável
  guardian: {
    name: string;
    cpf: string;
    phone: string;
    email: string;
    profession: string;
  };
  
  // Contatos de Emergência
  emergencyContacts: Array<{
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  }>;
  
  // Dados de Saúde
  healthInfo: {
    allergies?: string;
    medications?: string;
    restrictions?: string;
    doctorContact?: string;
    healthPlan?: string;
  };
  
  // Dados Acadêmicos
  enrolledSports: string[]; // IDs das modalidades
  status: 'active' | 'inactive' | 'pending';
  enrollmentDate: string;
  monthlyFee: number;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  lastPayment?: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  nickname: string;
  identity: string;
  cpf: string;
  education: string;
  specialization: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  address: string;
  modalitiesIds: string[]; // IDs das modalidades que leciona
  status: 'active' | 'inactive';
  hireDate: string;
  salary: number;
}

export interface Employee {
  id: string;
  fullName: string;
  roleId: string;
  login: string;
  password: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface Payment {
  id: string;
  studentId: string;
  studentName: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  sport: string;
  month: string; // YYYY-MM
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  type: 'training' | 'match' | 'evaluation' | 'meeting' | 'special' | 'inaugural';
  sport?: string;
  students?: string[]; // IDs dos alunos
  location: string;
  instructor?: string;
  frequency?: 'daily' | 'weekly' | 'monthly';
  daysOfWeek?: string[]; // Para eventos semanais
}

export interface Sport {
  id: string;
  name: string;
  description: string;
  ageRange: {
    min: number;
    max: number;
  };
  monthlyFee: number;
  weeklyHours: number;
  maxStudents: number;
  currentStudents: number;
  status: 'active' | 'inactive';
  instructor: string;
  schedule: Array<{
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
    startTime: string;
    endTime: string;
  }>;
}

export interface InauguralClass {
  id: string;
  studentId: string;
  selectedDate: string;
  selectedModality: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface DashboardMetrics {
  totalStudents: number;
  monthlyRevenue: number;
  defaultRate: number;
  upcomingEvents: number;
  churnRate: number;
  totalTeachers: number;
  totalEmployees: number;
}

export interface PaymentFilters {
  status: 'all' | 'paid' | 'pending' | 'overdue';
  month: string;
  sport: string;
}

export interface StudentFilters {
  search: string;
  sport: string;
  status: string;
  paymentStatus: string;
}

export interface FinancialReport {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  studentCount: number;
  churnRate: number;
  defaultRate: number;
}