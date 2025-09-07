import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Users, Trophy } from 'lucide-react';
import { mockTeachers } from '@/data/mockTeachers';
import { mockSports } from '@/data/mockSports';
import { Teacher } from '@/types';
import { toast } from 'sonner';

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState(mockTeachers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
    identity: '',
    cpf: '',
    education: '',
    specialization: '',
    age: '',
    gender: 'male' as 'male' | 'female' | 'other',
    phone: '',
    email: '',
    address: '',
    modalitiesIds: [] as string[],
    salary: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModalityToggle = (modalityId: string) => {
    setFormData(prev => ({
      ...prev,
      modalitiesIds: prev.modalitiesIds.includes(modalityId)
        ? prev.modalitiesIds.filter(id => id !== modalityId)
        : [...prev.modalitiesIds, modalityId]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const teacherData: Teacher = {
      id: editingTeacher?.id || Date.now().toString(),
      fullName: formData.fullName,
      nickname: formData.nickname,
      identity: formData.identity,
      cpf: formData.cpf,
      education: formData.education,
      specialization: formData.specialization,
      age: parseInt(formData.age),
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      modalitiesIds: formData.modalitiesIds,
      status: 'active',
      hireDate: editingTeacher?.hireDate || new Date().toISOString().split('T')[0],
      salary: parseFloat(formData.salary)
    };

    if (editingTeacher) {
      setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? teacherData : t));
      toast.success('Professor atualizado com sucesso!');
    } else {
      setTeachers(prev => [...prev, teacherData]);
      toast.success('Professor cadastrado com sucesso!');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      nickname: '',
      identity: '',
      cpf: '',
      education: '',
      specialization: '',
      age: '',
      gender: 'male',
      phone: '',
      email: '',
      address: '',
      modalitiesIds: [],
      salary: ''
    });
    setEditingTeacher(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      fullName: teacher.fullName,
      nickname: teacher.nickname,
      identity: teacher.identity,
      cpf: teacher.cpf,
      education: teacher.education,
      specialization: teacher.specialization,
      age: teacher.age.toString(),
      gender: teacher.gender,
      phone: teacher.phone,
      email: teacher.email,
      address: teacher.address,
      modalitiesIds: teacher.modalitiesIds,
      salary: teacher.salary.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    toast.success('Professor removido com sucesso!');
  };

  const getModalityNames = (modalityIds: string[]) => {
    return modalityIds.map(id => {
      const modality = mockSports.find(s => s.id === id);
      return modality?.name || '';
    }).filter(Boolean);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Professores</h1>
          <p className="text-muted-foreground">Gerencie os professores da academia</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Professor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTeacher ? 'Editar Professor' : 'Novo Professor'}</DialogTitle>
              <DialogDescription>
                Preencha os dados do professor
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nickname">Como é chamado</Label>
                  <Input
                    id="nickname"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="identity">Identidade</Label>
                  <Input
                    id="identity"
                    name="identity"
                    value={formData.identity}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Formação</Label>
                  <Input
                    id="education"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Especialização</Label>
                  <Input
                    id="specialization"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Idade</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    value={formData.age}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gênero</Label>
                  <Select value={formData.gender} onValueChange={(value: 'male' | 'female' | 'other') => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Salário</Label>
                  <Input
                    id="salary"
                    name="salary"
                    type="number"
                    step="0.01"
                    value={formData.salary}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Modalidades</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {mockSports.filter(sport => sport.name !== 'Aula Inaugural').map(sport => (
                    <div key={sport.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`modality-${sport.id}`}
                        checked={formData.modalitiesIds.includes(sport.id)}
                        onChange={() => handleModalityToggle(sport.id)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`modality-${sport.id}`} className="text-sm">
                        {sport.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTeacher ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Lista de Professores
          </CardTitle>
          <CardDescription>
            {teachers.length} professor(es) cadastrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome / Apelido</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Modalidades</TableHead>
                <TableHead>Salário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map(teacher => (
                <TableRow key={teacher.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{teacher.fullName}</p>
                      <p className="text-sm text-muted-foreground">{teacher.nickname}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{teacher.phone}</p>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getModalityNames(teacher.modalitiesIds).slice(0, 2).map(name => (
                        <Badge key={name} variant="secondary" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                      {teacher.modalitiesIds.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{teacher.modalitiesIds.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>R$ {teacher.salary.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={teacher.status === 'active' ? 'default' : 'secondary'}>
                      {teacher.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(teacher)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(teacher.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Teachers;