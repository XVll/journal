import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ReactNode } from 'react';

interface HintProps {
    label: string;
    children: ReactNode;
    asChild?: boolean;
    side?: 'top' | 'bottom' | 'left' | 'right';
    align?: 'start' | 'center' | 'end';
    offset?: number;
}

export const Hint = ({ label, children, asChild, side, align, offset }: HintProps) => {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
                <TooltipContent side={side} align={align} sideOffset={offset}>
                    {label}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
