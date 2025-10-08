import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useSports } from '@/hooks/useSports';
import { Link } from 'react-router-dom';
import Button from '@/components/shared/Button';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedSport, setSelectedSport] = useState<string>('all');
  
  // Get events and sports from Supabase
  const { data: events = [], isLoading, isError } = useEvents();
  const { data: sports = [], isLoading: sportsLoading, isError: sportsError } = useSports();
  
  // Get current month events
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  // Format events to match the calendar requirements
  const formattedEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    date: `${event.date}T${event.start_time}`, // Format date and time together
    startTime: event.start_time,
    type: event.type || 'training',
    sport: event.sport_id || '', // Use UUID directly
  }));
  
  const monthEvents = formattedEvents.filter(event => {
    const eventDate = new Date(event.date);
    const matchesMonth = eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
    const matchesSport = selectedSport === 'all' || event.sport === selectedSport;
    return matchesMonth && matchesSport;
  });
  
  if (isLoading || sportsLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-3 text-muted-foreground">Carregando agenda...</p>
        </div>
      </div>
    );
  }
  
  if (isError || sportsError) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-10">
          <div className="text-destructive">Erro ao carregar dados</div>
          <p className="mt-2 text-muted-foreground">Tente novamente mais tarde</p>
        </div>
      </div>
    );
  }

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const calendarDays = [];
  
  // Previous month's trailing days
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = new Date(firstDayOfMonth);
    day.setDate(day.getDate() - i - 1);
    calendarDays.push({ date: day, isCurrentMonth: false });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({ 
      date: new Date(currentYear, currentMonth, day), 
      isCurrentMonth: true 
    });
  }
  
  // Next month's leading days
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({ 
      date: new Date(currentYear, currentMonth + 1, day), 
      isCurrentMonth: false 
    });
  }

  const getEventsForDay = (date: Date) => {
    return monthEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'training': return 'bg-info text-info-foreground';
      case 'match': return 'bg-success text-success-foreground';
      case 'evaluation': return 'bg-warning text-warning-foreground';
      case 'meeting': return 'bg-destructive text-destructive-foreground';
      case 'special': return 'bg-primary text-primary-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Agenda Esportiva</h1>
          <p className="text-muted-foreground">Treinos, jogos e eventos da academia</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <CalendarIcon className="w-4 h-4" />
            Hoje
          </Button>
          <Link to="/events/new">
            <Button variant="primary">
              <Plus className="w-4 h-4" />
              Novo Evento
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar Header with Navigation */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6 shadow-academy">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-2xl font-bold text-foreground">
              {monthNames[currentMonth]} {currentYear}
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Sport Filter */}
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select 
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="bg-input border border-border rounded-lg px-3 py-2 text-foreground"
            >
              <option value="all">Todas as modalidades</option>
              {sports.map(sport => (
                <option key={sport.id} value={sport.id.toString()}>{sport.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Week headers */}
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-muted-foreground border-b border-border">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {calendarDays.map((day, index) => {
            const dayEvents = getEventsForDay(day.date);
            const isToday = day.date.toDateString() === new Date().toDateString();
            
            return (
              <div 
                key={index}
                className={`min-h-[120px] p-2 border border-border/50 ${
                  day.isCurrentMonth ? 'bg-card' : 'bg-muted/30'
                } ${isToday ? 'ring-2 ring-primary' : ''}`}
              >
                <div className={`text-sm font-medium mb-2 ${
                  day.isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                } ${isToday ? 'text-primary font-bold' : ''}`}>
                  {day.date.getDate()}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map(event => (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded text-center cursor-pointer hover:opacity-80 transition-opacity ${getEventTypeColor(event.type)}`}
                      title={`${event.title} - ${event.startTime}`}
                    >
                      {event.title.length > 15 ? `${event.title.slice(0, 15)}...` : event.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground text-center">
                      +{dayEvents.length - 3} mais
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Legend */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
        <h3 className="text-lg font-semibold text-foreground mb-4">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-info rounded"></div>
            <span className="text-sm text-muted-foreground">Treinos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-success rounded"></div>
            <span className="text-sm text-muted-foreground">Jogos</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-warning rounded"></div>
            <span className="text-sm text-muted-foreground">Avaliações</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-destructive rounded"></div>
            <span className="text-sm text-muted-foreground">Reuniões</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded"></div>
            <span className="text-sm text-muted-foreground">Eventos Especiais</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;