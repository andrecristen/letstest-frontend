import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PainelNavbar from './PainelNavbar';
import tokenService from '../../services/tokenService';
import notifyService from '../../services/notifyService';

const PainelContainer = (props: any) => {

    const navigate = useNavigate();

    if (!tokenService.getSessionToken()) {
        navigate('/login');
        notifyService.info("Você precisa estar logado para acessar essa área do sistema.");
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
