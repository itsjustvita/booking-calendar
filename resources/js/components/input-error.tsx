import { cn } from '@/lib/utils';
import { type HTMLAttributes } from 'react';

export default function InputError({ message, className = '', ...props }: HTMLAttributes<HTMLParagraphElement> & { message?: string }) {
    return message ? (
        <p {...props} className={cn('text-sm font-medium text-red-300 drop-shadow-md dark:text-red-400', className)}>
            {message}
        </p>
    ) : null;
}
