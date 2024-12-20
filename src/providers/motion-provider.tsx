'use client';
import { LazyMotion, domAnimation } from 'framer-motion';
import { ReactNode } from 'react';

export default function MotionProvider({ children }: { children: ReactNode }) {
    return (
        <LazyMotion strict features={domAnimation}>
            {children}
        </LazyMotion>
    );
}