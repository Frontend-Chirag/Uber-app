import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { X } from "lucide-react";

interface DialoagContainerProps {
  children: React.ReactNode;
  name: string;
  title: string;
  description?: string;
}

export function DialogContainer({ children, name, title, description }: DialoagContainerProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">{name}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description && description}
          </DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              <X />
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
