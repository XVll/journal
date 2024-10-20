"use client"
import { cn } from '@/lib/utils';
import { ReactNode, useEffect, useState } from 'react';

interface ExtendedSwitchProps {
    checked?: 'left' | 'middle' | 'right';
    defaultChecked?: 'left' | 'middle' | 'right';
    onCheckedChange?: (option: 'left' | 'middle' | 'right') => void;
    leftIcon?: ReactNode;
    middleIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export function TrioSwitch({ checked, onCheckedChange, defaultChecked, leftIcon, middleIcon, rightIcon }: ExtendedSwitchProps) {
    const [selection, setSelection] = useState(defaultChecked || checked || 'right');

    useEffect(() => {
        setSelection(checked || 'right');
    }, [checked]);
    const onChange = (option: 'left' | 'middle' | 'right') => {
        setSelection(option);
        onCheckedChange && onCheckedChange(option);
    };

    return (
        <div
            className={
                'peer relative inline-flex  h-[24px] w-[58px] shrink-0 cursor-pointer items-center overflow-hidden rounded-full border bg-background-bt3 pl-[1px] pr-[2px] shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50'
            }
        >
            <div
                className={cn(
                    'pointer-events-none z-10 inline-flex h-[20px] w-[20px] items-center justify-center rounded-full border border-border-darker bg-background-b2 transition-all duration-300',
                    selection === 'left' ? 'translate-x-0' : selection === 'middle' ? 'translate-x-[17px]' : 'translate-x-[34px]'
                )}
            >
                <span className={'text-foreground-f3 duration-300 animate-in fade-in'}>
                    {selection === 'left' ? leftIcon : selection === 'middle' ? middleIcon : rightIcon}
                </span>
            </div>
            <div className={'absolute flex h-full w-[96%]'}>
                <div onClick={() => onChange('left')} className={'flex h-full flex-1 items-center justify-center transition-all duration-200'}>
                    <span className={'h-2 w-2 rounded-full bg-background-bt2 hover:bg-foreground-ft3'}></span>
                </div>
                <div onClick={() => onChange('middle')} className={'flex h-full flex-1 items-center justify-center transition-all duration-200'}>
                    <span className={'h-2 w-2 rounded-full bg-background-bt2 transition-colors hover:bg-foreground-ft3'}></span>
                </div>
                <div onClick={() => onChange('right')} className={'flex h-full flex-1 items-center justify-center transition-all duration-200'}>
                    <span className={'h-2 w-2 rounded-full bg-background-bt2 transition-colors hover:bg-foreground-ft3'}></span>
                </div>
            </div>
        </div>
    );
}
