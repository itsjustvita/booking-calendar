import { type PropsWithChildren } from 'react';

interface AuthLayoutProps {
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    return (
        <div
            className="relative flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10"
            style={{
                backgroundImage: "url('/huette-background.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Overlay für bessere Lesbarkeit */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>

            <div className="relative z-10 w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    {/* Glassmorphism Card */}
                    <div className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
                        <div className="mb-6 flex flex-col items-center gap-4">
                            <div className="space-y-2 text-center">
                                <h1 className="text-2xl font-semibold text-white drop-shadow-lg">{title}</h1>
                                <p className="text-center text-sm text-white/80 drop-shadow-md">{description}</p>
                            </div>
                        </div>

                        {/* Form Container mit zusätzlichem Glassmorphism */}
                        <div className="">{children}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
