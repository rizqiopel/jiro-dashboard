import { useForm } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useI18n } from '@/lib/i18n';
import { destroy } from '@/routes/projects';
import type { Project } from '@/types/project';

export function DeleteProject({ project }: { project: Project }) {
    const { t } = useI18n();
    const [open, setOpen] = useState(false);
    const form = useForm({});
    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                if (!form.processing) setOpen(value);
            }}
        >
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive"
                    aria-label={`${t('Delete project')}: ${project.name}`}
                >
                    {t('Delete')}
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogTitle>{t('Delete project')}?</DialogTitle>
                <DialogDescription>
                    {t(
                        'This permanently deletes the project. This cannot be undone.',
                    )}{' '}
                    <span className="mt-2 block font-medium break-words text-foreground">
                        {project.name}
                    </span>
                </DialogDescription>
                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        disabled={form.processing}
                        onClick={() => setOpen(false)}
                    >
                        {t('Cancel')}
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={form.processing}
                        onClick={() =>
                            form.delete(destroy(project.id).url, {
                                onSuccess: () => setOpen(false),
                                onError: () =>
                                    toast.error(
                                        t(
                                            'Could not delete the project. Please try again.',
                                        ),
                                    ),
                            })
                        }
                    >
                        {form.processing && <Spinner />}
                        {t('Confirm deletion')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
