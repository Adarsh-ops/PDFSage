import { Loader2 } from 'lucide-react';

export function Loader() {
  return (
    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>Thinking...</span>
    </div>
  );
}