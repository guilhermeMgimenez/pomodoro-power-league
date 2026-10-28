import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Trophy } from "lucide-react";

interface CompletionModalProps {
  open: boolean;
  onClose: () => void;
  earnedStardust: number;
}

export const CompletionModal = ({ open, onClose, earnedStardust }: CompletionModalProps) => (
  <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
    <DialogContent className="sm:max-w-md bg-popover border-foreground/10 rounded-2xl">
      <div className="flex flex-col items-center py-8 px-4">
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-reward blur-3xl opacity-25 rounded-full" />
          <Trophy strokeWidth={1.25} className="w-24 h-24 text-reward relative z-10" />
        </div>
        <DialogTitle className="font-display text-4xl font-bold text-reward mb-2 tracking-wide">Sessão concluída</DialogTitle>
        <DialogDescription className="text-muted-foreground text-center mb-8">Mais uma estrela acesa no seu céu.</DialogDescription>
        <div className="night-card w-full p-6 text-center mb-8">
          <p className="text-reward text-sm font-semibold mb-2">STARDUST</p>
          <div className="flex items-center justify-center gap-2">
            <Sparkles strokeWidth={1.5} className="w-6 h-6 text-reward" />
            <span className="font-display text-3xl font-bold text-reward">+{earnedStardust}</span>
          </div>
        </div>
        <Button onClick={onClose} className="w-full h-14 text-lg font-display font-semibold rounded-2xl">Continuar</Button>
      </div>
    </DialogContent>
  </Dialog>
);
