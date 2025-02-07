import { Message } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

interface ChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
}

export default function ChatHistory({ messages, isLoading }: ChatHistoryProps) {
  if (isLoading) {
    return (
      <Card className="p-4 h-[600px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  return (
    <Card className="p-4 h-[600px]">
      <h2 className="font-semibold mb-4">Chat History</h2>
      <ScrollArea className="h-[calc(100%-2rem)]">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className="p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
            >
              <p className="text-sm truncate">{message.content}</p>
              <span className="text-xs text-muted-foreground">
                {format(new Date(message.timestamp), "MMM d, h:mm a")}
              </span>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
