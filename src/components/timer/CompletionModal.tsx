import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Star, X } from "lucide-react";
import { useState } from "react";

interface CompletionModalProps {
  open: boolean;
  onClose: () => void;
  earnedXP: number;
  earnedCoins: number;
}

export const CompletionModal = ({ open, onClose, earnedXP, earnedCoins }: CompletionModalProps) => {
  const [quality, setQuality] = useState<number>(0);
  const [showRewards, setShowRewards] = useState(false);

  const handleContinue = () => {
    if (quality === 0) {
      setShowRewards(true);
    } else {
      onClose();
      setQuality(0);
      setShowRewards(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-background border-border">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center py-8 px-4">
          {/* Trophy Icon */}
          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-neon-yellow blur-3xl opacity-50 rounded-full" />
            <Trophy className="w-24 h-24 text-neon-yellow relative z-10" />
          </div>

          {/* Title */}
          <h2 className="text-4xl font-black text-accent mb-2 tracking-wider">
            VITÓRIA!
          </h2>
          <p className="text-muted-foreground text-center mb-8">
            Sessão concluída! Suas recompensas te esperam.
          </p>

          {/* Rewards */}
          {showRewards && (
            <div className="w-full grid grid-cols-2 gap-4 mb-8 animate-fade-in">
              <div className="bg-card/50 rounded-lg p-6 text-center">
                <p className="text-xp-color text-sm font-bold mb-2">XP</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-black text-xp-color">{earnedXP}</span>
                  <span className="text-xp-color text-xl">+</span>
                </div>
              </div>
              <div className="bg-card/50 rounded-lg p-6 text-center">
                <p className="text-coin-color text-sm font-bold mb-2">MOEDAS</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-3xl font-black text-coin-color">{earnedCoins}</span>
                  <span className="text-coin-color text-xl">+</span>
                </div>
              </div>
            </div>
          )}

          {/* Quality Rating */}
          <div className="w-full mb-8">
            <p className="text-accent text-center font-bold mb-4 tracking-wide">
              QUALIDADE DA SESSÃO
            </p>
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setQuality(star)}
                  className="transition-all hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= quality
                        ? "fill-neon-yellow text-neon-yellow"
                        : "fill-muted text-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            className="w-full h-14 text-lg font-bold gradient-neon hover:opacity-90 transition-opacity"
          >
            CONTINUAR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
