import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Message } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { langflowClient } from "@/lib/langflow-client";
import { apiRequest, queryClient } from "@/lib/queryClient";
import ChatMessage from "./chat-message";
import ChatHistory from "./chat-history";

export default function ChatInterface() {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      try {
        const response = await langflowClient.runFlow(
          "edf93eff-1384-4865-bc9e-b7bbcbd9ed1a",
          "2e964804-1fee-4340-bb22-099f1e785ec1",
          content
        );

        if (!response) {
          throw new Error("No response from AI");
        }

        await apiRequest("POST", "/api/messages", {
          content,
          response: response
        });
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
    onSuccess: () => {
      setMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessage.isPending) {
      sendMessage.mutate(message);
    }
  };

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-8">
      <ChatHistory messages={messages || []} isLoading={isLoading} />

      <Card className="p-4 flex flex-col h-[600px]">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages?.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sendMessage.isPending}
          />
          <Button type="submit" disabled={sendMessage.isPending}>
            {sendMessage.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}