import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Users, MapPin, Heart, Trophy } from 'lucide-react';
import { mockSports } from '@/data/mockSports';
import { mockStudents } from '@/data/mockStudents';
import { Student } from '@/types';
import { toast } from 'sonner';
import PhotoUpload from '@/components/shared/PhotoUpload';

const NewStudent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('personal');
  const [formData, setFormData] = useState({
    // Dados Pessoais
    name: '',
    birthDate: '',
    cpf: '',
    photo: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zipCode: ''
    },
    // Dados do Responsável
    guardian: {
      name: '',
      cpf: '',
      phone: '',
      email: '',
      profession: ''
    },
    // Contatos de Emergência
    emergencyContacts: [
      { name: '', relationship: '', phone: '', email: '' }
    ],
    // Dados de Saúde
    healthInfo: {
      allergies: '',
      medications: '',
      restrictions: '',
      doctorContact: '',
      healthPlan: ''
    },
    // Modalidades
    enrolledSports: [] as string[],
    monthlyFee: 0
  });

  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section as keyof typeof prev] as any),
        [field]: value
      }
    }));
  };

  const handleDirectInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmergencyContactChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const addEmergencyContact = () => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, { name: '', relationship: '', phone: '', email: '' }]
    }));
  };

  const removeEmergencyContact = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== index)
    }));
  };

  const handleSportToggle = (sportId: string) => {
    setFormData(prev => {
      const isSelected = prev.enrolledSports.includes(sportId);
      const newEnrolledSports = isSelected
        ? prev.enrolledSports.filter(id => id !== sportId)
        : [...prev.enrolledSports, sportId];
      
      // Calcular nova mensalidade
      const newMonthlyFee = newEnrolledSports.reduce((total, id) => {
        const sport = mockSports.find(s => s.id === id);
        return total + (sport?.monthlyFee || 0);
      }, 0);

      return {
        ...prev,
        enrolledSports: newEnrolledSports,
        monthlyFee: newMonthlyFee
      };
    });
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getSuggestedModalities = () => {
    const age = calculateAge(formData.birthDate);
    return mockSports.filter(sport => 
      sport.name !== 'Aula Inaugural' &&
      age >= sport.ageRange.min && 
      age <= sport.ageRange.max
    );
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.birthDate || !formData.cpf) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    const newStudent: Student = {
      id: Date.now().toString(),
      name: formData.name,
      birthDate: formData.birthDate,
      cpf: formData.cpf,
      photo: formData.photo || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
      address: formData.address,
      guardian: formData.guardian,
      emergencyContacts: formData.emergencyContacts.filter(c => c.name && c.phone),
      healthInfo: formData.healthInfo,
      enrolledSports: formData.enrolledSports,
      status: 'active',
      enrollmentDate: new Date().toISOString().split('T')[0],
      monthlyFee: formData.monthlyFee,
      paymentStatus: 'pending'
    };

    // Simular salvamento
    mockStudents.push(newStudent);
    toast.success('Aluno cadastrado com sucesso!');
    
    // Reset form
    setFormData({
      name: '',
      birthDate: '',
      cpf: '',
      photo: '',
      address: {
        street: '',
        number: '',
        complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zipCode: ''
      },
      guardian: {
        name: '',
        cpf: '',
        phone: '',
        email: '',
        profession: ''
      },
      emergencyContacts: [
        { name: '', relationship: '', phone: '', email: '' }
      ],
      healthInfo: {
        allergies: '',
        medications: '',
        restrictions: '',
        doctorContact: '',
        healthPlan: ''
      },
      enrolledSports: [],
      monthlyFee: 0
    });
    setCurrentTab('personal');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Cadastro de Novo Aluno</h1>
        <p className="text-muted-foreground">Preencha todos os dados do novo aluno</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Pessoais
              </TabsTrigger>
              <TabsTrigger value="guardian" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Responsável
              </TabsTrigger>
              <TabsTrigger value="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Endereço
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Emergência & Saúde
              </TabsTrigger>
              <TabsTrigger value="sports" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Modalidades
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleDirectInputChange('name', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthDate">Data de Nascimento *</Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => handleDirectInputChange('birthDate', e.target.value)}
                      required
                    />
                    {formData.birthDate && (
                      <p className="text-sm text-muted-foreground">
                        Idade: {calculateAge(formData.birthDate)} anos
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => handleDirectInputChange('cpf', e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <PhotoUpload
                    value={formData.photo}
                    onChange={(photo) => handleDirectInputChange('photo', photo)}
                    label="Foto do Aluno"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="guardian" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Nome do Responsável *</Label>
                  <Input
                    id="guardianName"
                    value={formData.guardian.name}
                    onChange={(e) => handleInputChange('guardian', 'name', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianCpf">CPF do Responsável *</Label>
                  <Input
                    id="guardianCpf"
                    value={formData.guardian.cpf}
                    onChange={(e) => handleInputChange('guardian', 'cpf', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianPhone">Telefone *</Label>
                  <Input
                    id="guardianPhone"
                    value={formData.guardian.phone}
                    onChange={(e) => handleInputChange('guardian', 'phone', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianEmail">Email *</Label>
                  <Input
                    id="guardianEmail"
                    type="email"
                    value={formData.guardian.email}
                    onChange={(e) => handleInputChange('guardian', 'email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="guardianProfession">Profissão</Label>
                  <Input
                    id="guardianProfession"
                    value={formData.guardian.profession}
                    onChange={(e) => handleInputChange('guardian', 'profession', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="address" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="street">Rua/Avenida *</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Número *</Label>
                  <Input
                    id="number"
                    value={formData.address.number}
                    onChange={(e) => handleInputChange('address', 'number', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.address.complement}
                    onChange={(e) => handleInputChange('address', 'complement', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="neighborhood">Bairro *</Label>
                  <Input
                    id="neighborhood"
                    value={formData.address.neighborhood}
                    onChange={(e) => handleInputChange('address', 'neighborhood', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP *</Label>
                  <Input
                    id="zipCode"
                    value={formData.address.zipCode}
                    onChange={(e) => handleInputChange('address', 'zipCode', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade *</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Estado *</Label>
                  <Select value={formData.address.state} onValueChange={(value) => handleInputChange('address', 'state', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">Acre</SelectItem>
                      <SelectItem value="AL">Alagoas</SelectItem>
                      <SelectItem value="AP">Amapá</SelectItem>
                      <SelectItem value="AM">Amazonas</SelectItem>
                      <SelectItem value="BA">Bahia</SelectItem>
                      <SelectItem value="CE">Ceará</SelectItem>
                      <SelectItem value="DF">Distrito Federal</SelectItem>
                      <SelectItem value="ES">Espírito Santo</SelectItem>
                      <SelectItem value="GO">Goiás</SelectItem>
                      <SelectItem value="MA">Maranhão</SelectItem>
                      <SelectItem value="MT">Mato Grosso</SelectItem>
                      <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                      <SelectItem value="MG">Minas Gerais</SelectItem>
                      <SelectItem value="PA">Pará</SelectItem>
                      <SelectItem value="PB">Paraíba</SelectItem>
                      <SelectItem value="PR">Paraná</SelectItem>
                      <SelectItem value="PE">Pernambuco</SelectItem>
                      <SelectItem value="PI">Piauí</SelectItem>
                      <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                      <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                      <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      <SelectItem value="RO">Rondônia</SelectItem>
                      <SelectItem value="RR">Roraima</SelectItem>
                      <SelectItem value="SC">Santa Catarina</SelectItem>
                      <SelectItem value="SP">São Paulo</SelectItem>
                      <SelectItem value="SE">Sergipe</SelectItem>
                      <SelectItem value="TO">Tocantins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="emergency" className="space-y-6 mt-6">
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Contatos de Emergência</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addEmergencyContact}>
                      Adicionar Contato
                    </Button>
                  </div>
                  
                  {formData.emergencyContacts.map((contact, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-border rounded-lg">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={contact.name}
                          onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Parentesco</Label>
                        <Input
                          value={contact.relationship}
                          onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          value={contact.phone}
                          onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            value={contact.email}
                            onChange={(e) => handleEmergencyContactChange(index, 'email', e.target.value)}
                          />
                          {formData.emergencyContacts.length > 1 && (
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => removeEmergencyContact(index)}
                            >
                              Remover
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Informações de Saúde</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Alergias</Label>
                      <Textarea
                        id="allergies"
                        value={formData.healthInfo.allergies}
                        onChange={(e) => handleInputChange('healthInfo', 'allergies', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medications">Medicamentos em Uso</Label>
                      <Textarea
                        id="medications"
                        value={formData.healthInfo.medications}
                        onChange={(e) => handleInputChange('healthInfo', 'medications', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="restrictions">Restrições Médicas</Label>
                      <Textarea
                        id="restrictions"
                        value={formData.healthInfo.restrictions}
                        onChange={(e) => handleInputChange('healthInfo', 'restrictions', e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="doctorContact">Contato do Médico</Label>
                      <Input
                        id="doctorContact"
                        value={formData.healthInfo.doctorContact}
                        onChange={(e) => handleInputChange('healthInfo', 'doctorContact', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="healthPlan">Plano de Saúde</Label>
                      <Input
                        id="healthPlan"
                        value={formData.healthInfo.healthPlan}
                        onChange={(e) => handleInputChange('healthInfo', 'healthPlan', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="sports" className="space-y-6 mt-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Selecione as Modalidades</h3>
                
                {formData.birthDate && getSuggestedModalities().length > 0 && (
                  <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <h4 className="font-medium text-primary mb-2">Modalidades Sugeridas (baseada na idade)</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Para {calculateAge(formData.birthDate)} anos de idade:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {getSuggestedModalities().map(sport => (
                        <div
                          key={sport.id}
                          className="flex items-center justify-between p-3 border border-primary/30 rounded-lg cursor-pointer hover:bg-primary/5"
                          onClick={() => handleSportToggle(sport.id)}
                        >
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={formData.enrolledSports.includes(sport.id)}
                              onChange={() => handleSportToggle(sport.id)}
                              className="rounded border-gray-300"
                            />
                            <div>
                              <p className="font-medium text-foreground">{sport.name}</p>
                              <p className="text-sm text-muted-foreground">{sport.description}</p>
                              <p className="text-xs text-muted-foreground">Professor: {sport.instructor}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">R$ {sport.monthlyFee.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{sport.weeklyHours}h/semana</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mockSports.filter(sport => sport.name !== 'Aula Inaugural').map(sport => (
                    <div
                      key={sport.id}
                      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.enrolledSports.includes(sport.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleSportToggle(sport.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.enrolledSports.includes(sport.id)}
                          onChange={() => handleSportToggle(sport.id)}
                          className="rounded border-gray-300"
                        />
                        <div>
                          <p className="font-medium text-foreground">{sport.name}</p>
                          <p className="text-sm text-muted-foreground">{sport.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Idade: {sport.ageRange.min}-{sport.ageRange.max} anos | Professor: {sport.instructor}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">R$ {sport.monthlyFee.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{sport.weeklyHours}h/semana</p>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.enrolledSports.length > 0 && (
                  <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg">
                    <h4 className="font-semibold text-success mb-2">Resumo da Matrícula</h4>
                    <div className="space-y-2">
                      {formData.enrolledSports.map(sportId => {
                        const sport = mockSports.find(s => s.id === sportId);
                        return sport ? (
                          <div key={sportId} className="flex justify-between text-sm">
                            <span>{sport.name}</span>
                            <span>R$ {sport.monthlyFee.toFixed(2)}</span>
                          </div>
                        ) : null;
                      })}
                      <div className="border-t border-success/20 pt-2 flex justify-between font-semibold">
                        <span>Total Mensal:</span>
                        <span className="text-success">R$ {formData.monthlyFee.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const tabs = ['personal', 'guardian', 'address', 'emergency', 'sports'];
                const currentIndex = tabs.indexOf(currentTab);
                if (currentIndex > 0) setCurrentTab(tabs[currentIndex - 1]);
              }}
              disabled={currentTab === 'personal'}
            >
              Anterior
            </Button>
            
            {currentTab === 'sports' ? (
              <Button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.birthDate || !formData.cpf || formData.enrolledSports.length === 0}
              >
                Finalizar Cadastro
              </Button>
            ) : (
              <Button
                onClick={() => {
                  const tabs = ['personal', 'guardian', 'address', 'emergency', 'sports'];
                  const currentIndex = tabs.indexOf(currentTab);
                  if (currentIndex < tabs.length - 1) setCurrentTab(tabs[currentIndex + 1]);
                }}
              >
                Próximo
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewStudent;