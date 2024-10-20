'use client';
import { useTheme } from 'next-themes';
import { TrioSwitch } from '@/components/custom/trio-switch';
import { FaMoon } from 'react-icons/fa6';
import { PiCircleHalfFill } from 'react-icons/pi';
import { TiWeatherSunny } from 'react-icons/ti';

const ThemeSwitch = () => {
    const { theme, setTheme } = useTheme();
    const checked = theme === "system" ? "middle" : theme === "dark" ? "right" : "left";

    const onChange = (option: "left" | "middle" | "right") => {
        setTheme(option === "left" ? "light" : option === "middle" ? "system" : "dark");
    };

    return (
        <TrioSwitch
            checked={checked}
            onCheckedChange={onChange}
            leftIcon={<TiWeatherSunny className={"text-foreground-orange"} />}
            middleIcon={<PiCircleHalfFill />}
            rightIcon={<FaMoon className={"text-foreground-purple"} />}
        />
    );
};

export default ThemeSwitch;