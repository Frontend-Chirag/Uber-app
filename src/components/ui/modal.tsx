import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";

interface ModalProps {
    children: React.ReactNode;
    title?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

export const Modal = ({ children, title, open, onOpenChange }: ModalProps) => {

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                {title && (
                    <DialogHeader>
                        <DialogTitle>
                            {title}
                        </DialogTitle>
                    </DialogHeader>
                )}
                {children}
            </DialogContent>
        </Dialog>
    )
}