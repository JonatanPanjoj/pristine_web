import React from 'react';
import { createPortal } from 'react-dom';

interface ModalPortalProps {
  children: React.ReactNode;
}

// Monta el overlay al final de <body>.
// Un ancestro con `transform` (los motion.div de framer-motion) crea un containing
// block, y ahí `fixed inset-0` se ancla a esa vista en vez de al viewport: el fondo
// difuminado queda recortado y no cubre sidebar ni topbar. El portal lo evita.
const ModalPortal: React.FC<ModalPortalProps> = ({ children }) =>
  createPortal(children, document.body);

export default ModalPortal;
