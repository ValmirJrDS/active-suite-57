import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Loader2 } from 'lucide-react';
import { useSports } from '@/hooks/useSports';
import { useTeachers } from '@/hooks/useTeachers';
import { useCreateEvent } from '@/hooks/useEvents';
import { Event } from '@/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const NewEvent = () => { // CORREÇÃO 1: Removido o React.FC<{}>
  const navigate = useNavigate();
  const { data: sports = [], isLoading: sportsLoading } = useSports();
  const { data: teachers = [], isLoading: teachersLoading } = useTeachers();
  const createEventMutation = useCreateEvent();

  const [formData, setFormData] = useState<Partial<Event>>({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'training',
    location: '',
    frequency: 'daily',
    daysOfWeek: [],
    students: [],
  });

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.date || !formData.startTime || !formData.endTime || !formData.location) {
      toast.error('Por favor, preencha todos os campos obrigatórios: Título, Data, Horários e Local.');
      return;
    }
    
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(formData.startTime) || !timeRegex.test(formData.endTime)) {
      toast.error('Por favor, informe horários válidos no formato HH:mm.');
      return;
    }

    createEventMutation.mutate(formData as Omit<Event, 'id'>, {
      onSuccess: () => {
        toast.success('Evento criado com sucesso!');
        navigate('/calendar');
      },
      onError: (error: any) => {
        console.error("Error creating event:", error);
        toast.error(`Erro ao criar evento: ${error.message || 'Ocorreu um erro desconhecido.'}`);
      }
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Criar Novo Evento</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Evento</CardTitle>
          <CardDescription>Preencha as informações para agendar um novo evento no calendário.</CardDescription>
        </CardHeader>
        <CardContent>
       
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Evento *</Label>
              <Input id="title" value={formData.title} onChange={(e) => handleInputChange('title', e.target.value)} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Data *</Label>
                <Input id="date" type="date" value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Hora de Início *</Label>
                <Input id="startTime" type="time" value={formData.startTime} onChange={(e) => handleInputChange('startTime', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Hora de Término *</Label>
                <Input id="endTime" type="time" value={formData.endTime} onChange={(e) => handleInputChange('endTime', e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Local *</Label>
              <Input id="location" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)} />
            </div>
            
            <div className="flex justify-end space-x-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate('/calendar')}>Cancelar</Button>
              <Button type="submit" disabled={createEventMutation.isPending}>
                {createEventMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Criar Evento
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewEvent;