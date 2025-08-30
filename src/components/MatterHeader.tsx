import { Heart, Archive, Calendar, User } from "lucide-react";

const MatterHeader = () => {
  return (
    <header className="bg-gradient-warm px-6 py-8 text-center">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Heart className="w-8 h-8 text-warm-gold-foreground" />
          <h1 className="text-4xl font-serif font-bold text-warm-gold-foreground">
            Matter
          </h1>
        </div>
        <p className="text-lg text-warm-gold-foreground/80 mb-2">
          Digitally immortalizing mankind
        </p>
        <p className="text-sm text-warm-gold-foreground/60 max-w-2xl mx-auto">
          Every week, we ask you one simple question about your life. Your answers become 
          a living archive of who you are — preserved forever for those you love.
        </p>
      </div>
    </header>
  );
};

export default MatterHeader;