import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, MapPin, Users, Trophy, Plus } from 'lucide-react';
import { mockSports } from '@/data/mockSports';
import { mockTeachers } from '@/data/mockTeachers';
import { mockEvents } from '@/data/mockEvents';
import { Event } from '@/types';
import { toast } from 'sonner';

const daysOfWeek = [
  { value: 'monday', label: 'Segunda-feira' },
  { value: 'tuesday', label: 'Terça-feira' },
  { value: 'wednesday', label: 'Quarta-feira' },
  { value: 'thursday', label: 'Quinta-feira' },
  { value: 'friday', label: 'Sexta-feira' },
  { value: 'saturday', label: 'Sábado' },
  { value: 'sunday', label: 'Domingo' }
];

const NewEvent: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'training' as 'training' | 'match' | 'evaluation' | 'meeting' | 'special' | 'inaugural',
    sport: '',
    location: '',
    instructor: '',
    frequency: '' as 'daily' | 'weekly' | 'monthly' | '',
    daysOfWeek: [] as string[]
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter(d => d !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const generateRecurringEvents = (): Event[] => {
    const events: Event[] = [];
    const baseEvent = {
      title: formData.title,
      description: formData.description,
      startTime: formData.startTime,
      endTime: formData.endTime,
      type: formData.type,
      sport: formData.sport,
      location: formData.location,
      instructor: formData.instructor,
      students: []
    };

    const startDate = new Date(formData.date);
    const endDate = new Date(startDate);
    
    if (formData.frequency === 'monthly') {
      // Replicar todos os dias úteis de segunda a sábado por 30 dias
      endDate.setDate(startDate.getDate() + 30);
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        // Segunda (1) a Sábado meio-dia (6, mas só até meio-dia)
        if (dayOfWeek >= 1 && dayOfWeek <= 6) {
          events.push({
            ...baseEvent,
            id: `${Date.now()}-${d.getTime()}`,
            date: d.toISOString().split('T')[0]
          });
        }
      }
    } else if (formData.frequency === 'weekly') {
      // Replicar nos dias selecionados por 12 semanas
      endDate.setDate(startDate.getDate() + 84); // 12 semanas
      
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][d.getDay()];
        if (formData.daysOfWeek.includes(dayName)) {
          events.push({
            ...baseEvent,
            id: `${Date.now()}-${d.getTime()}`,
            date: d.toISOString().split('T')[0]
          });
        }
      }
    } else {
      // Evento único (daily)
      events.push({
        ...baseEvent,
        id: Date.now().toString(),
        date: formData.date
      });
    }

    return events;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    if (formData.frequency === 'weekly' && formData.daysOfWeek.length === 0) {
      toast.error('Selecione pelo menos um dia da semana para eventos semanais!');
      return;
    }

    const newEvents = generateRecurringEvents();
    
    // Simular salvamento
    newEvents.forEach(event => mockEvents.push(event));
    
    const message = newEvents.length === 1 
      ? 'Evento criado com sucesso!' 
      : `${newEvents.length} eventos criados com sucesso!`;
    
    toast.success(message);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'training',
      sport: '',
      location: '',
      instructor: '',
      frequency: '',
      daysOfWeek: []
    });
  };

  const getTeachersBySport = () => {
    if (!formData.sport) return mockTeachers;
    
    const sport = mockSports.find(s => s.id === formData.sport);
    if (!sport) return mockTeachers;
    
    return mockTeachers.filter(teacher => 
      teacher.modalitiesIds.includes(formData.sport) || 
      teacher.fullName === sport.instructor ||
      teacher.nickname === sport.instructor
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Criar Novo Evento</h1>
        <p className="text-muted-foreground">Crie eventos únicos ou recorrentes para a academia</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Detalhes do Evento
          </CardTitle>
          <CardDescription>
            Preencha as informações do evento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Evento *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Evento *</Label>
                <Select value={formData.type} onValueChange={(value) => handleSelectChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="training">Treino</SelectItem>
                    <SelectItem value="match">Jogo/Partida</SelectItem>
                    <SelectItem value="evaluation">Avaliação</SelectItem>
                    <SelectItem value="meeting">Reunião</SelectItem>
                    <SelectItem value="special">Evento Especial</SelectItem>
                    <SelectItem value="inaugural">Aula Inaugural</SelectItem>
                  </SelectContent>
                </Select>
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
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Horário de Início *</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Horário de Término *</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sport">Modalidade</Label>
                <Select value={formData.sport} onValueChange={(value) => handleSelectChange('sport', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockSports.map(sport => (
                      <SelectItem key={sport.id} value={sport.id}>
                        {sport.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">Professor/Instrutor</Label>
                <Select value={formData.instructor} onValueChange={(value) => handleSelectChange('instructor', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um professor" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTeachersBySport().map(teacher => (
                      <SelectItem key={teacher.id} value={teacher.nickname}>
                        {teacher.fullName} ({teacher.nickname})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Local *</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Ex: Campo Principal, Quadra de Futsal, Sala de Reuniões"
                required
              />
            </div>

            <div className="space-y-4">
              <Label>Frequência do Evento</Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.frequency === 'daily' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectChange('frequency', 'daily')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="frequency"
                      value="daily"
                      checked={formData.frequency === 'daily'}
                      onChange={() => handleSelectChange('frequency', 'daily')}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">Evento Único</p>
                      <p className="text-sm text-muted-foreground">Apenas no dia selecionado</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.frequency === 'weekly' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectChange('frequency', 'weekly')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="frequency"
                      value="weekly"
                      checked={formData.frequency === 'weekly'}
                      onChange={() => handleSelectChange('frequency', 'weekly')}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">Semanal</p>
                      <p className="text-sm text-muted-foreground">Repetir nos dias selecionados</p>
                    </div>
                  </div>
                </div>
                
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    formData.frequency === 'monthly' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleSelectChange('frequency', 'monthly')}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="frequency"
                      value="monthly"
                      checked={formData.frequency === 'monthly'}
                      onChange={() => handleSelectChange('frequency', 'monthly')}
                      className="rounded"
                    />
                    <div>
                      <p className="font-medium">Mensal</p>
                      <p className="text-sm text-muted-foreground">Seg-Sáb por 30 dias</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {formData.frequency === 'weekly' && (
              <div className="space-y-3">
                <Label>Dias da Semana</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {daysOfWeek.map(day => (
                    <div 
                      key={day.value}
                      className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.daysOfWeek.includes(day.value)
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleDayToggle(day.value)}
                    >
                      <Checkbox
                        checked={formData.daysOfWeek.includes(day.value)}
                        onCheckedChange={() => handleDayToggle(day.value)}
                      />
                      <span className="text-sm font-medium">{day.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.frequency === 'monthly' && (
              <div className="p-4 bg-info/10 border border-info/20 rounded-lg">
                <p className="text-sm text-info">
                  <strong>Eventos mensais:</strong> Serão criados eventos diários de segunda a sábado meio-dia 
                  por 30 dias a partir da data selecionada, excluindo domingos.
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
              <Button type="submit">
                <Plus className="w-4 h-4 mr-2" />
                Criar Evento{formData.frequency === 'monthly' || formData.frequency === 'weekly' ? 's' : ''}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewEvent;