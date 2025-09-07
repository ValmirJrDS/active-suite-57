import React, { useState, useMemo } from 'react';
import { Users, UserPlus, Search, Download, Eye } from 'lucide-react';
import { mockStudents } from '@/data/mockStudents';
import { mockSports } from '@/data/mockSports';
import { Student } from '@/types';
import Button from '@/components/shared/Button';
import FormInput from '@/components/shared/FormInput';
import StatusBadge from '@/components/shared/StatusBadge';
import Modal from '@/components/shared/Modal';

const Students: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [filterSport, setFilterSport] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredStudents = useMemo(() => {
    return mockStudents.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSport = filterSport === 'all' || student.enrolledSports.includes(filterSport);
      const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
      
      return matchesSearch && matchesSport && matchesStatus;
    });
  }, [searchTerm, filterSport, filterStatus]);

  const getStudentAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getSportNames = (sportIds: string[]) => {
    return sportIds.map(id => 
      mockSports.find(sport => sport.id === id)?.name || id
    ).join(', ');
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Gestão de Alunos</h1>
          <p className="text-muted-foreground">{filteredStudents.length} alunos encontrados</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4" />
            Exportar Lista
          </Button>
          <Button variant="primary">
            <UserPlus className="w-4 h-4" />
            Novo Aluno
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-academy">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            icon={<Search className="w-4 h-4" />}
            placeholder="Buscar aluno..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select 
            value={filterSport}
            onChange={(e) => setFilterSport(e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2 text-foreground"
          >
            <option value="all">Todas as modalidades</option>
            {mockSports.map(sport => (
              <option key={sport.id} value={sport.id}>{sport.name}</option>
            ))}
          </select>
          
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-input border border-border rounded-lg px-3 py-2 text-foreground"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="pending">Pendente</option>
          </select>
        </div>
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStudents.map(student => (
          <div key={student.id} className="bg-card border border-border rounded-lg p-6 shadow-academy hover:shadow-academy-glow transition-all cursor-pointer"
               onClick={() => setSelectedStudent(student)}>
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={student.photo} 
                alt={student.name}
                className="w-16 h-16 rounded-lg object-cover border-2 border-border"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{student.name}</h3>
                <p className="text-sm text-muted-foreground">{getStudentAge(student.birthDate)} anos</p>
              </div>
              <StatusBadge status={student.status} size="sm" />
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Modalidades</p>
                <p className="text-sm text-foreground">{getSportNames(student.enrolledSports)}</p>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground mb-1">Responsável</p>
                <p className="text-sm text-foreground">{student.guardian.name}</p>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <div>
                  <p className="text-xs text-muted-foreground">Mensalidade</p>
                  <p className="font-semibold text-foreground">R$ {student.monthlyFee.toFixed(2)}</p>
                </div>
                <StatusBadge status={student.paymentStatus} size="sm" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Student Profile Modal */}
      {selectedStudent && (
        <Modal
          isOpen={!!selectedStudent}
          onClose={() => setSelectedStudent(null)}
          title="Ficha do Aluno"
          size="lg"
        >
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="flex items-start gap-6">
              <img 
                src={selectedStudent.photo} 
                alt={selectedStudent.name}
                className="w-24 h-24 rounded-lg object-cover border-2 border-border"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">{selectedStudent.name}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Idade:</span>
                    <span className="ml-2 text-foreground">{getStudentAge(selectedStudent.birthDate)} anos</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CPF:</span>
                    <span className="ml-2 text-foreground">{selectedStudent.cpf}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="ml-2"><StatusBadge status={selectedStudent.status} size="sm" /></span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Matrícula:</span>
                    <span className="ml-2 text-foreground">{new Date(selectedStudent.enrollmentDate).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">Responsável</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome:</span>
                    <span className="ml-2 text-foreground">{selectedStudent.guardian.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telefone:</span>
                    <span className="ml-2 text-foreground">{selectedStudent.guardian.phone}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <span className="ml-2 text-foreground">{selectedStudent.guardian.email}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Profissão:</span>
                    <span className="ml-2 text-foreground">{selectedStudent.guardian.profession}</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">Endereço</h3>
                <div className="text-sm text-foreground">
                  <p>{selectedStudent.address.street}, {selectedStudent.address.number}</p>
                  {selectedStudent.address.complement && <p>{selectedStudent.address.complement}</p>}
                  <p>{selectedStudent.address.neighborhood}</p>
                  <p>{selectedStudent.address.city}, {selectedStudent.address.state}</p>
                  <p>{selectedStudent.address.zipCode}</p>
                </div>
              </div>
            </div>

            {/* Sports and Health */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">Modalidades</h3>
                <div className="space-y-2">
                  {selectedStudent.enrolledSports.map(sportId => {
                    const sport = mockSports.find(s => s.id === sportId);
                    return sport ? (
                      <div key={sportId} className="flex items-center justify-between">
                        <span className="text-foreground">{sport.name}</span>
                        <span className="text-sm text-success">R$ {sport.monthlyFee.toFixed(2)}</span>
                      </div>
                    ) : null;
                  })}
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-foreground">Total Mensal:</span>
                      <span className="text-primary">R$ {selectedStudent.monthlyFee.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4">
                <h3 className="font-semibold text-foreground mb-3">Informações de Saúde</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Alergias:</span>
                    <span className="ml-2 text-foreground">{selectedStudent.healthInfo.allergies || 'Nenhuma'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Medicamentos:</span>
                    <span className="ml-2 text-foreground">{selectedStudent.healthInfo.medications || 'Nenhum'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plano de Saúde:</span>
                    <span className="ml-2 text-foreground">{selectedStudent.healthInfo.healthPlan || 'Não informado'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Contatos de Emergência</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedStudent.emergencyContacts.map((contact, index) => (
                  <div key={index} className="text-sm">
                    <p className="font-medium text-foreground">{contact.name}</p>
                    <p className="text-muted-foreground">{contact.relationship}</p>
                    <p className="text-foreground">{contact.phone}</p>
                    {contact.email && <p className="text-foreground">{contact.email}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Students;