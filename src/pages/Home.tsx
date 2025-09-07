import React from 'react';
import { Users, DollarSign, AlertTriangle, Calendar, TrendingUp, Trophy } from 'lucide-react';
import { mockStudents } from '@/data/mockStudents';
import { mockPayments } from '@/data/mockPayments';
import { mockEvents } from '@/data/mockEvents';
import StatusBadge from '@/components/shared/StatusBadge';

const Home: React.FC = () => {
  // Calculate metrics
  const totalStudents = mockStudents.length;
  const currentMonthPayments = mockPayments.filter(p => p.month === '2024-08');
  const monthlyRevenue = currentMonthPayments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);
  const overdueCount = currentMonthPayments.filter(p => p.status === 'overdue').length;
  const defaultRate = Math.round((overdueCount / totalStudents) * 100);
  
  const upcomingEvents = mockEvents.filter(e => {
    const eventDate = new Date(e.date);
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= now && eventDate <= nextWeek;
  }).length;

  const recentPayments = mockPayments
    .filter(p => p.month === '2024-08')
    .slice(0, 5);

  const todayEvents = mockEvents.filter(e => {
    const eventDate = new Date(e.date);
    const today = new Date();
    return eventDate.toDateString() === today.toDateString();
  });

  return (
    <div className="container mx-auto p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Dashboard da Academia
        </h1>
        <p className="text-muted-foreground">
          Visão geral do desempenho e atividades da academia esportiva
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-info/10 rounded-lg">
              <Users className="w-6 h-6 text-info" />
            </div>
            <span className="text-2xl font-bold text-foreground">{totalStudents}</span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Total de Alunos</h3>
          <p className="text-xs text-muted-foreground mt-1">+2 novos este mês</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <span className="text-2xl font-bold text-foreground">
              R$ {monthlyRevenue.toLocaleString('pt-BR')}
            </span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Receita Mensal</h3>
          <p className="text-xs text-success mt-1">+8.2% vs mês anterior</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-destructive/10 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <span className="text-2xl font-bold text-foreground">{defaultRate}%</span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Inadimplência</h3>
          <p className="text-xs text-destructive mt-1">{overdueCount} alunos em atraso</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-warning/10 rounded-lg">
              <Calendar className="w-6 h-6 text-warning" />
            </div>
            <span className="text-2xl font-bold text-foreground">{upcomingEvents}</span>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground">Próximos Eventos</h3>
          <p className="text-xs text-muted-foreground mt-1">Próximos 7 dias</p>
        </div>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-card-foreground">Pagamentos Recentes</h3>
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div className="space-y-4">
            {recentPayments.map(payment => (
              <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium text-card-foreground">{payment.studentName}</p>
                  <p className="text-sm text-muted-foreground">{payment.sport}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-card-foreground">R$ {payment.amount.toFixed(2)}</p>
                  <StatusBadge status={payment.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Events */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-academy">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-card-foreground">Eventos de Hoje</h3>
            <Trophy className="w-5 h-5 text-primary" />
          </div>
          <div className="space-y-4">
            {todayEvents.length > 0 ? (
              todayEvents.map(event => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-card-foreground">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-card-foreground">
                      {event.startTime} - {event.endTime}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-lg ${
                      event.type === 'training' ? 'bg-info/20 text-info' :
                      event.type === 'match' ? 'bg-success/20 text-success' :
                      'bg-warning/20 text-warning'
                    }`}>
                      {event.type === 'training' ? 'Treino' : 
                       event.type === 'match' ? 'Jogo' : 'Evento'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum evento agendado para hoje</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;