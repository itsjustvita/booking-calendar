import { SVGProps } from 'react';

interface AppLogoProps extends SVGProps<SVGSVGElement> {
    className?: string;
}

export function AppLogo({ className, ...props }: AppLogoProps) {
    return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} {...props}>
            {/* Hüttendach */}
            <path d="M10 45 L50 15 L90 45 L85 45 L50 20 L15 45 Z" fill="currentColor" className="text-primary" />

            {/* Hüttenwände */}
            <rect x="20" y="45" width="60" height="35" fill="currentColor" className="text-primary" />

            {/* Tür */}
            <rect x="35" y="55" width="12" height="25" fill="white" />

            {/* Fenster */}
            <rect x="55" y="55" width="15" height="10" fill="white" />

            {/* Schornstein */}
            <rect x="65" y="25" width="6" height="25" fill="currentColor" className="text-primary" />
        </svg>
    );
}

// Default export für Kompatibilität
export default AppLogo;
