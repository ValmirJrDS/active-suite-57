import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, Clock, MapPin, Users, Trophy, Plus } from 'lucide-react';
import { useSports } from '@/hooks/useSports';
import { useTeachers } from '@/hooks/useTeachers';
import { useCreateEvent } from '@/hooks/useEvents';
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
  const { data: sports = [], isLoading: sportsLoading, isError: sportsError } = useSports();
  const { data: teachers = [], isLoading: teachersLoading, isError: teachersError } = useTeachers();
  const createEventMutation = useCreateEvent();
  
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

  if (sportsLoading || teachersLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-3 text-muted-foreground">Carregando formulário...</p>
        </div>
      </div>
    );
  }
  
  if (sportsError || teachersError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-10">
          <div className="text-destructive">Erro ao carregar dados</div>
          <p className="mt-2 text-muted-foreground">Tente novamente mais tarde</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Correção específica para campos de tempo
  const handleTimeChange = (field: 'startTime' | 'endTime') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, [field]: value }));
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
    
    if (!formData.title || !formData.date) {
      toast.error('Preencha todos os campos obrigatórios!');
      return;
    }

    if (formData.frequency === 'weekly' && formData.daysOfWeek.length === 0) {
      toast.error('Selecione pelo menos um dia da semana para eventos semanais!');
      return;
    }

    // Regra de negócio para eventos do tipo "Aula Inaugural"
    if (formData.type === 'inaugural') {
      // Validar que é um evento único
      if (formData.frequency !== 'daily') {
        toast.error('Aulas inaugurais devem ser eventos únicos (não recorrentes).');
        return;
      }
      
      // Validar que o título contém o nome da modalidade
      const selectedSport = sports.find(sport => sport.id === formData.sport);
      if (selectedSport && !formData.title.toLowerCase().includes(selectedSport.name.toLowerCase())) {
        toast.error(`O título da aula inaugural deve conter o nome da modalidade: ${selectedSport.name}`);
        return;
      }
    }

    // Validar que os campos obrigatórios não estejam vazios
    if (!formData.location) {
        toast.error('Preencha todos os campos obrigatórios: local.');
        return;
    }

    // Validação específica para campos de hora com mensagem mais clara
    if (!formData.startTime || !formData.endTime) {
        toast.error('Por favor, preencha a hora de início e de término do evento.');
        return;
    }

    // Validar formato dos horários (HH:mm)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.startTime) || !timeRegex.test(formData.endTime)) {
        toast.error('Por favor, informe horários válidos no formato HH:mm.');
        return;
    }

    // Criar um evento com base nos dados do formulário no formato UIEvent
    const eventToCreate = {
      title: formData.title,
      description: formData.description || '',
      date: formData.date, // YYYY-MM-DD
      startTime: formData.startTime, // HH:mm
      endTime: formData.endTime, // HH:mm
      location: formData.location,
      sport_id: formData.sport || undefined, // UUID como string ou undefined
      instructor_id: formData.instructor || undefined, // UUID como string ou undefined
      type: formData.type,
      students: [],
      created_at: '',
      updated_at: ''
    };

    // Debug: verificar se os campos de tempo estão sendo capturados corretamente
    console.log('FormData antes do envio:', formData);
    console.log('EventToCreate:', eventToCreate);

    createEventMutation.mutate(eventToCreate, {
      onSuccess: () => {
        toast.success('Evento criado com sucesso!');
        
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
      },
      onError: (error) => {
        console.error('Error creating event:', error);
        toast.error('Erro ao criar evento. Por favor, tente novamente.');
      }
    });
  };

  const getTeachersBySport = () => {
    if (!formData.sport) return teachers;
    
    // Filtrar professores que tem a modalidade selecionada
    return teachers.filter(teacher => 
      teacher.modalities_ids?.includes(parseInt(formData.sport))
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
                  onChange={handleTimeChange('startTime')}
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
                  onChange={handleTimeChange('endTime')}
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
                    {sports.map(sport => (
                      <SelectItem key={sport.id} value={sport.id.toString()}>
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
                      <SelectItem key={teacher.id} value={teacher.id.toString()}>
                        {teacher.full_name} ({teacher.nickname})
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