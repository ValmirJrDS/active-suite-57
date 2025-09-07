import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, Trophy, Clock, Users, DollarSign } from 'lucide-react';
import { mockSports } from '@/data/mockSports';
import { Sport } from '@/types';
import { toast } from 'sonner';

const daysOfWeek = [
  { value: 'monday', label: 'Segunda' },
  { value: 'tuesday', label: 'Terça' },
  { value: 'wednesday', label: 'Quarta' },
  { value: 'thursday', label: 'Quinta' },
  { value: 'friday', label: 'Sexta' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' }
];

const Modalities: React.FC = () => {
  const [sports, setSports] = useState(mockSports);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSport, setEditingSport] = useState<Sport | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ageMin: '',
    ageMax: '',
    monthlyFee: '',
    weeklyHours: '',
    maxStudents: '',
    instructor: '',
    schedule: [{ day: 'monday', startTime: '', endTime: '' }]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addScheduleSlot = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { day: 'monday', startTime: '', endTime: '' }]
    }));
  };

  const removeScheduleSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sportData: Sport = {
      id: editingSport?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      ageRange: {
        min: parseInt(formData.ageMin),
        max: parseInt(formData.ageMax)
      },
      monthlyFee: parseFloat(formData.monthlyFee),
      weeklyHours: parseInt(formData.weeklyHours),
      maxStudents: parseInt(formData.maxStudents),
      currentStudents: editingSport?.currentStudents || 0,
      status: 'active',
      instructor: formData.instructor,
      schedule: formData.schedule.filter(s => s.startTime && s.endTime).map(s => ({
        day: s.day as any,
        startTime: s.startTime,
        endTime: s.endTime
      }))
    };

    if (editingSport) {
      setSports(prev => prev.map(s => s.id === editingSport.id ? sportData : s));
      toast.success('Modalidade atualizada com sucesso!');
    } else {
      setSports(prev => [...prev, sportData]);
      toast.success('Modalidade cadastrada com sucesso!');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      ageMin: '',
      ageMax: '',
      monthlyFee: '',
      weeklyHours: '',
      maxStudents: '',
      instructor: '',
      schedule: [{ day: 'monday', startTime: '', endTime: '' }]
    });
    setEditingSport(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (sport: Sport) => {
    setEditingSport(sport);
    setFormData({
      name: sport.name,
      description: sport.description,
      ageMin: sport.ageRange.min.toString(),
      ageMax: sport.ageRange.max.toString(),
      monthlyFee: sport.monthlyFee.toString(),
      weeklyHours: sport.weeklyHours.toString(),
      maxStudents: sport.maxStudents.toString(),
      instructor: sport.instructor,
      schedule: sport.schedule.map(s => ({
        day: s.day,
        startTime: s.startTime,
        endTime: s.endTime
      }))
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSports(prev => prev.filter(s => s.id !== id));
    toast.success('Modalidade removida com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Modalidades</h1>
          <p className="text-muted-foreground">Gerencie as modalidades esportivas da academia</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Modalidade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSport ? 'Editar Modalidade' : 'Nova Modalidade'}</DialogTitle>
              <DialogDescription>
                Preencha os dados da modalidade esportiva
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Modalidade</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructor">Instrutor/Professor</Label>
                  <Input
                    id="instructor"
                    name="instructor"
                    value={formData.instructor}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ageMin">Idade Mínima</Label>
                  <Input
                    id="ageMin"
                    name="ageMin"
                    type="number"
                    value={formData.ageMin}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ageMax">Idade Máxima</Label>
                  <Input
                    id="ageMax"
                    name="ageMax"
                    type="number"
                    value={formData.ageMax}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyFee">Mensalidade (R$)</Label>
                  <Input
                    id="monthlyFee"
                    name="monthlyFee"
                    type="number"
                    step="0.01"
                    value={formData.monthlyFee}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStudents">Máximo de Alunos</Label>
                  <Input
                    id="maxStudents"
                    name="maxStudents"
                    type="number"
                    value={formData.maxStudents}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Horários das Aulas</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addScheduleSlot}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Horário
                  </Button>
                </div>
                
                {formData.schedule.map((schedule, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-border rounded-lg">
                    <div className="space-y-2">
                      <Label>Dia da Semana</Label>
                      <Select 
                        value={schedule.day} 
                        onValueChange={(value) => handleScheduleChange(index, 'day', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {daysOfWeek.map(day => (
                            <SelectItem key={day.value} value={day.value}>
                              {day.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Hora de Início</Label>
                      <Input
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => handleScheduleChange(index, 'startTime', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hora de Término</Label>
                      <Input
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => handleScheduleChange(index, 'endTime', e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex items-end">
                      {formData.schedule.length > 1 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeScheduleSlot(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingSport ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sports.map(sport => (
          <Card key={sport.id} className="hover:shadow-academy-glow transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                {sport.name}
              </CardTitle>
              <CardDescription>{sport.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{sport.currentStudents}/{sport.maxStudents} alunos</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{sport.weeklyHours}h/semana</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>R$ {sport.monthlyFee.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Idade: </span>
                  <span>{sport.ageRange.min}-{sport.ageRange.max} anos</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Professor:</p>
                <Badge variant="secondary">{sport.instructor}</Badge>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Horários:</p>
                <div className="space-y-1">
                  {sport.schedule.map((schedule, index) => (
                    <div key={index} className="text-xs text-muted-foreground">
                      {daysOfWeek.find(d => d.value === schedule.day)?.label}: {schedule.startTime} - {schedule.endTime}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button size="sm" variant="outline" onClick={() => handleEdit(sport)} className="flex-1">
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleDelete(sport.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Modalities;