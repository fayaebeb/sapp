import { Message } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className="space-y-2">
      <div className={cn(
        "rounded-lg p-4 max-w-[80%]",
        "bg-primary/10"
      )}>
        <p className="text-sm">{message.content}</p>
      </div>
      
      <div className={cn(
        "rounded-lg p-4 max-w-[80%] ml-auto",
        "bg-primary text-primary-foreground"
      )}>
        <p className="text-sm">{message.response}</p>
      </div>
    </div>
  );
}
