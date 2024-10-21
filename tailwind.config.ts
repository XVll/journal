import type { Config } from "tailwindcss";
import tailwindcssAnimate from 'tailwindcss-animate';


const config: Config = {
  darkMode: ["class"],
  content: ["./src/pages/**/*.{js,ts,jsx,tsx,mdx}", "./src/components/**/*.{js,ts,jsx,tsx,mdx}", "./src/app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
  	extend: {
  		colors: {
  			input: 'hsla(var(--bt2))',
  			ring: 'hsla(var(--bt2))',
  			foreground: {
  				DEFAULT: 'hsl(var(--f1))',
  				f1: 'hsl(var(--f1))',
  				f2: 'hsl(var(--f2))',
  				f3: 'hsl(var(--f3))',
  				f4: 'hsl(var(--f4))',
  				ft1: 'hsla(var(--ft1))',
  				ft2: 'hsl(var(--ft2))',
  				ft3: 'hsl(var(--ft3))',
  				contrast: 'hsl(var(--f-contrast))',
  				blue: 'hsl(var(--blue))',
  				green: 'hsl(var(--green))',
  				orange: 'hsl(var(--orange))',
  				pink: 'hsl(var(--pink))',
  				purple: 'hsl(var(--purple))',
  				red: 'hsl(var(--red))',
  				yellow: 'hsl(var(--yellow))'
  			},
  			background: {
  				b0: 'hsl(var(--b0))',
  				DEFAULT: 'hsl(var(--b1))',
  				b1: 'hsl(var(--b1))',
  				b2: 'hsl(var(--b2))',
  				b3: 'hsl(var(--b3))',
  				bt1: 'hsla(var(--bt1))',
  				bt2: 'hsla(var(--bt2))',
  				bt3: 'hsla(var(--bt3))',
  				contrast: 'hsl(var(--b-contrast))',
  				blue: 'hsla(var(--blue-bg))',
  				green: 'hsla(var(--green-bg))',
  				orange: 'hsla(var(--orange-bg))',
  				pink: 'hsla(var(--pink-bg))',
  				purple: 'hsla(var(--purple-bg))',
  				red: 'hsla(var(--red-bg))',
  				yellow: 'hsla(var(--yellow-bg))'
  			},
  			border: {
  				lighter: 'hsla(var(--bt3))',
  				DEFAULT: 'hsla(var(--bt2))',
  				darker: 'hsla(var(--bt1))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--b-contrast))',
  				foreground: 'hsl(var(--f-contrast))'
  			},
  			secondary: {
  				DEFAULT: 'hsla(var(--b3))',
  				foreground: 'hsl(var(--f2))'
  			},
  			destructive: {
  				DEFAULT: 'hsla(var(--red-bg))',
  				foreground: 'hsl(var(--red))'
  			},
  			muted: {
  				DEFAULT: 'hsla(var(--bt2))',
  				foreground: 'hsl(var(--f4))'
  			},
  			accent: {
  				DEFAULT: 'hsla(var(--bt2))',
  				foreground: 'hsl(var(--f1))'
  			},
  			popover: {
  				DEFAULT: 'hsla(var(--bt1))',
  				foreground: 'hsl(var(--f1))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--b2))',
  				foreground: 'hsl(var(--f1))'
  			},
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
};
export default config;
