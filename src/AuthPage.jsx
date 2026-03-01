import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function AuthPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-pink-100 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-pink-600 mb-2">🍰 Doce Encanto</h1>
                    <p className="text-gray-500 font-medium">Faça login para acessar seu painel</p>
                </div>
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-pink-100">
                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: '#ec4899',
                                        brandAccent: '#db2777',
                                    },
                                    borderWidths: {
                                        buttonBorderWidth: '0px',
                                    },
                                    radii: {
                                        borderRadiusButton: '12px',
                                        inputBorderRadius: '12px',
                                    },
                                },
                            },
                        }}
                        localization={{
                            variables: {
                                sign_in: {
                                    email_label: 'Email',
                                    password_label: 'Senha',
                                    email_input_placeholder: 'seu@email.com',
                                    password_input_placeholder: 'Sua senha',
                                    button_label: 'Entrar',
                                    loading_button_label: 'Entrando...',
                                    social_provider_text: 'Entrar com {{provider}}',
                                    link_text: 'Já tem uma conta? Entre aqui',
                                },
                                sign_up: {
                                    email_label: 'Email',
                                    password_label: 'Criar senha',
                                    email_input_placeholder: 'seu@email.com',
                                    password_input_placeholder: 'Mínimo 6 caracteres',
                                    button_label: 'Criar conta',
                                    loading_button_label: 'Criando conta...',
                                    link_text: 'Não tem conta? Cadastre-se',
                                },
                                forgotten_password: {
                                    email_label: 'Email',
                                    email_input_placeholder: 'seu@email.com',
                                    button_label: 'Enviar link de redefinição',
                                    loading_button_label: 'Enviando...',
                                    link_text: 'Esqueceu sua senha?',
                                },
                            },
                        }}
                        providers={[]}
                    />
                </div>
            </div>
        </div>
    );
}
