import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profil-Einstellungen',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profil-Einstellungen" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profil-Informationen" description="Aktualisieren Sie Ihren Namen und Ihre E-Mail-Adresse" />

                    <div className="glass-card rounded-xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-white">Name</Label>

                                <Input
                                    id="name"
                                    className="mt-1 block w-full bg-white/20 border-white/30 text-white placeholder:text-white/70"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    autoComplete="name"
                                    placeholder="Vollständiger Name"
                                />

                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-white">E-Mail-Adresse</Label>

                                <Input
                                    id="email"
                                    type="email"
                                    className="mt-1 block w-full bg-white/20 border-white/30 text-white placeholder:text-white/70"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoComplete="username"
                                    placeholder="E-Mail-Adresse"
                                />

                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div className="rounded-lg bg-amber-50/20 border border-amber-200/30 p-4">
                                    <p className="text-sm text-amber-100">
                                        Ihre E-Mail-Adresse ist nicht verifiziert.{' '}
                                        <Link
                                            href={route('verification.send')}
                                            method="post"
                                            as="button"
                                            className="text-amber-200 underline decoration-amber-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current"
                                        >
                                            Klicken Sie hier, um die Bestätigungs-E-Mail erneut zu senden.
                                        </Link>
                                    </p>

                                    {status === 'verification-link-sent' && (
                                        <div className="mt-2 text-sm font-medium text-green-300">
                                            Ein neuer Bestätigungslink wurde an Ihre E-Mail-Adresse gesendet.
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="flex items-center gap-4">
                                <Button disabled={processing} className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                                    Speichern
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

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
