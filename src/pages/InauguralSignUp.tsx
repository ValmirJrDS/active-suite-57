import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const InauguralSignUp = () => {
  const navigate = useNavigate();
  const { signUp, updateProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    guardianName: '',
    guardianEmail: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.guardianName || !formData.guardianEmail || !formData.password) {
        throw new Error('Por favor, preencha todos os campos obrigatórios.');
      }

      // Primeiro, criar usuário sem metadados customizados
      const { data: signUpData, error } = await signUp(formData.guardianEmail, formData.password);

      if (error) {
        throw error;
      }

      // Se o signUp foi bem-sucedido, tentar atualizar o perfil
      if (signUpData?.user) {
        try {
          // Aguardar um pouco para o trigger criar o registro na tabela profiles
          await new Promise(resolve => setTimeout(resolve, 1000));

          await updateProfile({
            full_name: formData.guardianName,
            registration_flow: 'inaugural',
            onboarding_completed: false,
          });
        } catch (profileError) {
          console.warn('Erro ao atualizar perfil, mas usuário foi criado:', profileError);
          // Não falhar aqui, pois o usuário foi criado com sucesso
        }
      }

      toast.success("Cadastro realizado com sucesso! Por favor, verifique seu e-mail para confirmar a conta e depois faça o login.");
      navigate('/login');

    } catch (error: any) {
      console.error("Erro no processo de cadastro inaugural:", error);
      toast.error(`Erro no cadastro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Cadastro para Aula Inaugural</CardTitle>
          <CardDescription>Crie sua conta de responsável para agendar a aula experimental do seu filho.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg border-b pb-2">Seus Dados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guardianName">Nome Completo</Label>
                  <Input id="guardianName" value={formData.guardianName} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="guardianEmail">E-mail</Label>
                  <Input id="guardianEmail" type="email" value={formData.guardianEmail} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Crie uma Senha</Label>
                <Input id="password" type="password" value={formData.password} onChange={handleInputChange} required minLength={6} />
              </div>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Próximo passo:</strong> Após criar sua conta e fazer login, você será direcionado para cadastrar os dados do seu filho e agendar a aula inaugural.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar Conta"}
            </Button>
            <div className="mt-4 text-center text-sm">
              Já tem uma conta?{' '}
              <Link to="/login" className="underline">
                Faça o login
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default InauguralSignUp;