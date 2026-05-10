import React, { useEffect } from 'react';
import NsCard from './NsCard';
import NsButton from './NsButton';

export default function NsConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'danger',
    confirmText = 'Confirmar',
    cancelText = 'Cancelar'
}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm transition-opacity">
            <div className="absolute inset-0" onClick={onClose}></div>
            <div className="relative w-full max-w-md shadow-2xl rounded-2xl transform transition-all">
                <NsCard className="overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                        <p className="text-sm text-gray-600 mb-6">{message}</p>
                        
                        <div className="flex justify-end gap-3">
                            <NsButton variant="ghost" onClick={onClose}>
                                {cancelText}
                            </NsButton>
                            <NsButton variant={type} onClick={() => { onConfirm(); onClose(); }}>
                                {confirmText}
                            </NsButton>
                        </div>
                    </div>
                </NsCard>
            </div>
        </div>
    );
}
