import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Phone, Video } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface MessageThreadProps {
  userId: string;
  currentUserId: string;
  userName: string;
  userAvatar?: string;
  onCall?: () => void;
  onVideoCall?: () => void;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  receiver: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
}

export default function MessageThread({ 
  userId, 
  currentUserId, 
  userName, 
  userAvatar, 
  onCall, 
  onVideoCall 
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["/api/messages", userId],
    enabled: !!userId,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/messages", {
        receiverId: userId,
        content,
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages", userId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // WebSocket connection for real-time messaging
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      ws.send(JSON.stringify({ type: 'auth', userId: currentUserId }));
      setSocket(ws);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_message') {
        queryClient.invalidateQueries({ queryKey: ["/api/messages", userId] });
      }
    };

    ws.onclose = () => {
      setSocket(null);
    };

    return () => {
      ws.close();
    };
  }, [userId, currentUserId, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage.trim());
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else if (diffInHours < 24 * 7) {
      return format(date, 'EEE h:mm a');
    } else {
      return format(date, 'MMM dd, h:mm a');
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-white rounded-3xl shadow-lg border-0 h-96">
        <CardContent className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-golden"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-3xl shadow-lg border-0 h-96 flex flex-col">
      {/* Header */}
      <CardHeader className="border-b border-cream">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 bg-golden rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {userName.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}
            <CardTitle className="text-lg font-bold text-golden-dark">{userName}</CardTitle>
          </div>
          <div className="flex space-x-2">
            {onCall && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onCall}
                className="border-golden text-golden hover:bg-golden hover:text-white"
              >
                <Phone className="w-4 h-4" />
              </Button>
            )}
            {onVideoCall && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onVideoCall}
                className="border-vitality text-vitality hover:bg-vitality hover:text-white"
              >
                <Video className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-grow flex flex-col p-0">
        <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-warm-brown">Start a conversation with {userName}</p>
              </div>
            ) : (
              messages.map((message: Message) => {
                const isOwnMessage = message.senderId === currentUserId;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        isOwnMessage
                          ? 'bg-golden text-white rounded-br-sm'
                          : 'bg-cream text-warm-brown rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isOwnMessage ? 'text-white/70' : 'text-warm-brown/70'
                        }`}
                      >
                        {formatMessageTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="border-t border-cream p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow border-cream focus:ring-golden focus:border-golden"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sendMessageMutation.isPending}
              className="bg-golden hover:bg-golden-dark text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
