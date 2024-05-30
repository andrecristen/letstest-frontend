import React from 'react';
import { useNavigate } from 'react-router-dom';
import PainelNavbar from './PainelNavbar';
import tokenProvider from '../infra/tokenProvider';
import notifyProvider from '../infra/notifyProvider';

const PainelContainer = (props: any) => {

    const navigate = useNavigate();

    if (!tokenProvider.getSessionToken()) {
        navigate('/login');
        notifyProvider.info("Você precisa estar logado para acessar essa área do sistema.");
        window.location.assign("/login")
        return null;
    }

    return (
        <>
            <React.StrictMode>
                <PainelNavbar>
                    {props.children}
                </PainelNavbar>
            </React.StrictMode>
        </>
    );
};

export default PainelContainer;
