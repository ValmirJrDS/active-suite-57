import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import supabase from "@/lib/supabaseClient";

const EnrollmentSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInauguralTransition, setIsInauguralTransition] = useState(false);
  const [studentData, setStudentData] = useState<any>(null);

  const { signUp, user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Verificar se é transição de usuário inaugural
  const fromInaugural = searchParams.get('from') === 'inaugural';
  const studentId = searchParams.get('student_id');

  // Carregar dados do estudante se for transição inaugural
  useEffect(() => {
    if (fromInaugural && studentId && user) {
      setIsInauguralTransition(true);
      loadStudentData();
    }
  }, [fromInaugural, studentId, user]);

  const loadStudentData = async () => {
    try {
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', studentId)
        .single();

      if (error) throw error;
      setStudentData(student);
    } catch (error: any) {
      toast.error('Erro ao carregar dados do estudante: ' + error.message);
    }
  };

  const handleInauguralTransition = async () => {
    setIsLoading(true);
    try {
      // Atualizar status do estudante de provisional para effective
      const { error: studentError } = await supabase
        .from('students')
        .update({ status: 'effective' })
        .eq('id', studentId);

      if (studentError) throw studentError;

      // Atualizar perfil do usuário para enrollment
      await updateProfile({
        registration_flow: 'enrollment',
        onboarding_completed: true
      });

      toast.success('Matrícula finalizada com sucesso!');
      navigate('/enrollment-dashboard');
    } catch (error: any) {
      toast.error('Erro ao finalizar matrícula: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Se é transição inaugural, apenas processar pagamento/finalização
    if (isInauguralTransition) {
      await handleInauguralTransition();
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await signUp(email, password, {
        data: {
          full_name: fullName,
          registration_flow: 'enrollment'
        }
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Cadastro realizado! Verifique seu e-mail para confirmar.");
        navigate("/login");
      }
    } catch (error: any) {
      toast.error("Erro ao criar conta: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md bg-card border border-border shadow-lg">
        <CardHeader>
          <CardTitle className="text-foreground">
            {isInauguralTransition ? 'Finalizar Matrícula' : 'Matrícula Direta'}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isInauguralTransition
              ? 'Finalize a matrícula do seu filho e efetue o pagamento'
              : 'Crie sua conta para efetuar a matrícula do seu filho'
            }
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {isInauguralTransition && studentData ? (
              // Mostrar dados do estudante para confirmação
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Dados do Estudante</h3>
                  <p><strong>Nome:</strong> {studentData.name}</p>
                  <p><strong>Data de Nascimento:</strong> {new Date(studentData.birthDate).toLocaleDateString('pt-BR')}</p>
                  <p><strong>Status:</strong> Provisório (será efetivado após pagamento)</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Informações de Pagamento</h3>
                  <p>Mensalidade: R$ {studentData.monthlyFee || '150,00'}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    Ao finalizar, o estudante será efetivado e terá acesso a todas as atividades.
                  </p>
                </div>
              </div>
            ) : (
              // Formulário de cadastro normal
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Crie uma senha segura"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirme sua senha"
                  />
                </div>
              </>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isInauguralTransition ? 'Finalizando...' : 'Criando conta...'}
                </>
              ) : (
                isInauguralTransition ? "Finalizar Matrícula e Pagar" : "Criar Conta e Continuar"
              )}
            </Button>
            {!isInauguralTransition && (
              <>
                <div className="text-center text-sm">
                  Já tem uma conta?{" "}
                  <Link to="/login" className="underline">
                    Faça login
                  </Link>
                </div>
                <div className="text-center text-sm">
                  Quer participar da aula inaugural?{" "}
                  <Link to="/inaugural-signup" className="underline">
                    Aula Inaugural
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default EnrollmentSignUp;