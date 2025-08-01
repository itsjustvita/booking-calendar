import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Passwort-Einstellungen',
        href: '/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Passwort-Einstellungen" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Passwort aktualisieren"
                        description="Stellen Sie sicher, dass Ihr Account ein langes, zufälliges Passwort verwendet, um sicher zu bleiben"
                    />

                    <div className="glass-card rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                        <form onSubmit={updatePassword} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="current_password" className="text-white">
                                    Aktuelles Passwort
                                </Label>

                                <Input
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    value={data.current_password}
                                    onChange={(e) => setData('current_password', e.target.value)}
                                    type="password"
                                    className="mt-1 block w-full border-white/30 bg-white/20 text-white placeholder:text-white/70"
                                    autoComplete="current-password"
                                    placeholder="Aktuelles Passwort"
                                />

                                <InputError message={errors.current_password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password" className="text-white">
                                    Neues Passwort
                                </Label>

                                <Input
                                    id="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    type="password"
                                    className="mt-1 block w-full border-white/30 bg-white/20 text-white placeholder:text-white/70"
                                    autoComplete="new-password"
                                    placeholder="Neues Passwort"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation" className="text-white">
                                    Passwort bestätigen
                                </Label>

                                <Input
                                    id="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    type="password"
                                    className="mt-1 block w-full border-white/30 bg-white/20 text-white placeholder:text-white/70"
                                    autoComplete="new-password"
                                    placeholder="Passwort bestätigen"
                                />

                                <InputError message={errors.password_confirmation} />
                            </div>

                            <div className="flex items-center gap-4">
                                <Button disabled={processing} className="border-white/30 bg-white/20 text-white hover:bg-white/30">
                                    Passwort speichern
                                </Button>

                                <Transition
                                    show={recentlySuccessful}
                                    enter="transition ease-in-out"
                                    enterFrom="opacity-0"
                                    leave="transition ease-in-out"
                                    leaveTo="opacity-0"
                                >
                                    <p className="text-sm text-white/80">Gespeichert</p>
                                </Transition>
                            </div>
                        </form>
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
