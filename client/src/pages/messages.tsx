import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import MessageThread from "@/components/message-thread";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquare, Search, Users, Phone, Video } from "lucide-react";
import { format } from "date-fns";

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

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  lastMessage?: Message;
  unreadCount: number;
  isProvider?: boolean;
  specialty?: string;
}

export default function Messages() {
  const { user } = useAuth();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: recentMessages = [] } = useQuery({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });

  // Process messages to create contact list
  const getContacts = (): Contact[] => {
    const contactMap = new Map<string, Contact>();
    
    recentMessages.forEach((message: Message) => {
      const isOutgoing = message.senderId === user?.id;
      const contactUser = isOutgoing ? message.receiver : message.sender;
      const contactId = contactUser.id;
      
      if (!contactMap.has(contactId)) {
        contactMap.set(contactId, {
          id: contactId,
          firstName: contactUser.firstName,
          lastName: contactUser.lastName,
          profileImageUrl: contactUser.profileImageUrl,
          lastMessage: message,
          unreadCount: 0,
          isProvider: false, // This would need to be determined from user roles
        });
      }
      
      const contact = contactMap.get(contactId)!;
      
      // Update last message if this one is more recent
      if (!contact.lastMessage || new Date(message.createdAt) > new Date(contact.lastMessage.createdAt)) {
        contact.lastMessage = message;
      }
      
      // Count unread messages
      if (!message.isRead && message.receiverId === user?.id) {
        contact.unreadCount++;
      }
    });
    
    return Array.from(contactMap.values()).sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  };

  const contacts = getContacts();
  
  const filteredContacts = contacts.filter((contact) => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(date, 'h:mm a');
    } else if (diffInHours < 24 * 7) {
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM dd');
    }
  };

  const getTotalUnreadCount = () => {
    return contacts.reduce((total, contact) => total + contact.unreadCount, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-soft-yellow to-warm-orange-light">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-golden-dark mb-2 flex items-center gap-3">
            <MessageSquare className="w-8 h-8" />
            Messages
            {getTotalUnreadCount() > 0 && (
              <Badge className="bg-warm-orange text-white border-0">
                {getTotalUnreadCount()} new
              </Badge>
            )}
          </h1>
          <p className="text-xl text-warm-brown">
            Secure communication with your healthcare providers.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 h-[600px]">
          {/* Contacts Sidebar */}
          <Card className="bg-white rounded-3xl shadow-lg border-0 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-golden-dark flex items-center gap-2">
                <Users className="w-5 h-5" />
                Conversations
              </CardTitle>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-brown/50 w-4 h-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-cream focus:ring-golden focus:border-golden"
                />
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <ScrollArea className="h-96">
                {filteredContacts.length === 0 ? (
                  <div className="text-center py-12 px-6">
                    <MessageSquare className="w-12 h-12 text-warm-brown/30 mx-auto mb-4" />
                    <p className="text-warm-brown">
                      {contacts.length === 0 ? "No conversations yet" : "No matching conversations"}
                    </p>
                    <p className="text-sm text-warm-brown/70 mt-2">
                      Start by booking an appointment with a provider
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredContacts.map((contact) => (
                      <button
                        key={contact.id}
                        onClick={() => setSelectedContact(contact)}
                        className={`w-full p-4 text-left hover:bg-cream transition-colors ${
                          selectedContact?.id === contact.id ? 'bg-cream' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {contact.profileImageUrl ? (
                            <img 
                              src={contact.profileImageUrl} 
                              alt={`${contact.firstName} ${contact.lastName}`}
                              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-golden rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-sm">
                                {contact.firstName[0]}{contact.lastName[0]}
                              </span>
                            </div>
                          )}
                          
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-semibold text-golden-dark truncate">
                                {contact.isProvider ? 'Dr. ' : ''}{contact.firstName} {contact.lastName}
                              </h4>
                              <div className="flex items-center space-x-2">
                                {contact.lastMessage && (
                                  <span className="text-xs text-warm-brown/70">
                                    {formatMessageTime(contact.lastMessage.createdAt)}
                                  </span>
                                )}
                                {contact.unreadCount > 0 && (
                                  <Badge className="bg-warm-orange text-white border-0 text-xs">
                                    {contact.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {contact.specialty && (
                              <p className="text-xs text-warm-brown/70 mb-1">{contact.specialty}</p>
                            )}
                            
                            {contact.lastMessage && (
                              <p className="text-sm text-warm-brown truncate">
                                {contact.lastMessage.senderId === user?.id ? 'You: ' : ''}
                                {contact.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Thread */}
          <div className="lg:col-span-2">
            {selectedContact ? (
              <MessageThread
                userId={selectedContact.id}
                currentUserId={user?.id || ""}
                userName={`${selectedContact.firstName} ${selectedContact.lastName}`}
                userAvatar={selectedContact.profileImageUrl}
                onCall={() => {
                  // Implement call functionality
                  console.log("Initiating call with", selectedContact.firstName);
                }}
                onVideoCall={() => {
                  // Implement video call functionality
                  console.log("Initiating video call with", selectedContact.firstName);
                }}
              />
            ) : (
              <Card className="bg-white rounded-3xl shadow-lg border-0 h-full">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-warm-brown/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-golden-dark mb-2">Select a Conversation</h3>
                    <p className="text-warm-brown max-w-sm">
                      Choose a conversation from the sidebar to start messaging with your healthcare providers.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Communication Guidelines */}
        <Card className="bg-sunset-gradient/10 rounded-3xl shadow-lg border-0 mt-8">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-golden-dark mb-4">Secure Communication Guidelines</h3>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div>
                <h4 className="font-semibold text-golden-dark mb-2">📱 Response Times</h4>
                <p className="text-warm-brown text-sm">
                  Providers typically respond within 24 hours during business days. 
                  For urgent matters, please call your provider directly.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-golden-dark mb-2">🔒 Privacy & Security</h4>
                <p className="text-warm-brown text-sm">
                  All messages are encrypted and HIPAA-compliant. Your conversations 
                  are private and secure between you and your healthcare team.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-golden-dark mb-2">🌍 Cultural Sensitivity</h4>
                <p className="text-warm-brown text-sm">
                  Feel free to share cultural context, traditional practices, or 
                  specific cultural health concerns. Our providers value this information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
