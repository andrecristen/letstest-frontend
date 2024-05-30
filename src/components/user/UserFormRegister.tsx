import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo-transparente.png';
import { registerAccount } from '../../services/authService';
import notifyService from '../../services/notifyService';
import { RegisterData } from '../../types/RegisterData';
import '../../styles/form.css';

const UserFormRegister = () => {

    const navigate = useNavigate();

    const { register, handleSubmit, setValue } = useForm<RegisterData>()
    const [validatingRegister, setValidatingRegister] = useState(false);


    const redirectToHome = () => {
        navigate('/');
    }

    const redirectToLogin = () => {
        navigate('/login');
    }

    const onSubmit: SubmitHandler<RegisterData> = async (data) => {
        setValidatingRegister(true);
        if (data.password != data.confirmPassword) {
            notifyService.info("Senhas não coincidem");
            setValue("password", undefined);
            setValue("confirmPassword", undefined);
            setValidatingRegister(false);
            return;
        }
        const response = await registerAccount(data);
        if (response?.status == 200) {
            notifyService.success("Conta criada com sucesso");
            redirectToLogin();
        } else {
            notifyService.error("Erro ao se registrar, tente novamente");
        }
        setValidatingRegister(false);
    }

    return (
        <section>
            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                <div onClick={redirectToHome} className="flex items-center mb-6 text-2xl font-semibold text-purple-600 dark:text-white">
                    <img className="px-12" src={logo} alt="logo" />
                </div>
                <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
                    <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                        <h1 className="text-xl text-center font-bold leading-tight tracking-tight text-purple-600 md:text-2xl dark:text-white">
                            Crie uma conta
                        </h1>
                        <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(onSubmit)}>
                            <div>
                                <input
                                    {...register("name")}
                                    type="text"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Seu nome completo"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    {...register("email")}
                                    type="email"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    placeholder="Email"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    {...register("password")}
                                    type="password"
                                    placeholder="Senha"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    {...register("confirmPassword")}
                                    type="password"
                                    placeholder="Confirmar senha"
                                    className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    required
                                />
                            </div>
                            {/* <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        aria-describedby="terms"
                                        type="checkbox"
                                        className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus-ring-primary-600 dark:ring-offset-gray-800"
                                        required
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-light text-gray-500 dark:text-gray-300">
                                        Aceito os <a className="font-medium text-primary-600 hover:underline dark:text-primary-500" href="#">
                                            Termos e Condições
                                        </a>
                                    </label>
                                </div>
                            </div> */}
                            <button
                                type="submit"
                                disabled={validatingRegister}
                                className="action-button-purple justify-center"
                            >
                                {validatingRegister ? <FiLoader className="text-white animate-spin" size={30} /> : "Criar Conta"}
                            </button>
                            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                                Já tem uma conta? <a href="/login" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Faça login aqui</a>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UserFormRegister;
