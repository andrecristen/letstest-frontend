import { AuthData } from '../types/AuthData';

const API_URL = process.env.REACT_APP_API_URL;

export const login = async (data: AuthData): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/users/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error('Erro ao fazer login.');
        }
    } catch (error) {
        console.log(error);
        throw new Error('Erro ao fazer login.');
    }
};
