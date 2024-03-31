import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/authService';
import notifyService from '../services/notifyService';
import tokenService from '../services/tokenService';
import { AuthData } from '../types/AuthData';
import logo from '../assets/logo-transparente.png'

const Login = () => {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [validatingLogin, setValidatingLogin] = useState(false);

    const handleLogin = async (event : any) => {
        try {
            event.preventDefault();
            setValidatingLogin(true);
            const data: AuthData = { email, password };
            const response = await auth(data);
            if (response?.status == 200) {
                tokenService.setSession(response.data.token, response.data.userId);
                notifyService.success("Login realizado com sucesso");
                navigate("/painel");
                return;
            } else if (response?.data.error) {
                notifyService.error(response?.data.error);
            } else {
                notifyService.error('Erro ao realizar login');
            } 
            setEmail("");   
            setPassword("");   
            setValidatingLogin(false);
        } catch (error) {
            notifyService.error('Erro ao realizar login');
        }
    };

    const redirectToHome = () => {
        navigate('/');
    }

    return (
        <>
        <section className="h-screen flex flex-col md:flex-row justify-center space-y-10 md:space-y-0 md:space-x-16 items-center my-2 mx-5 md:mx-0 md:my-0">
            <div className="md:w-1/3 max-w-sm" onClick={redirectToHome}>
                <img src={logo} alt="Logo login" />
            </div>
            <form onSubmit={handleLogin} className="md:w-1/3 max-w-sm">
                <input className="text-sm w-full px-4 py-2 border border-solid border-gray-300 rounded" required type="text" placeholder="Login" value={email} onChange={(e) => setEmail(e.target.value)} />
                <input className="text-sm w-full px-4 py-2 border border-solid border-gray-300 rounded mt-4" required type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
                <div className="text-center md:text-center">
                    <button disabled={validatingLogin ? true : false} className="mt-4 bg-purple-600 hover:bg-purple-700 px-4 py-2 text-white uppercase rounded text-xs tracking-wider" type="submit">Login</button>
                </div>
                <div className="mt-4 font-semibold text-sm text-slate-500 text-center md:text-center">
                    Ainda não possui uma conta? <a className="text-red-600 hover:underline hover:underline-offset-4" href="/register">Crie agora</a>
                </div>
            </form>
        </section>
    </>
    );
};

export default Login;
