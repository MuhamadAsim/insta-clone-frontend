
import { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  ArrowLeft, 
  Phone, 
  Video, 
  MoreVertical, 
  Smile, 
  Paperclip, 
  Mic, 
  Send,
  Image as ImageIcon,
  Reply,
  Edit,
  Trash2
} from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  timestamp: string;
  isSent: boolean;
  type: 'text' | 'image' | 'voice';
  imageUrl?: string;
  voiceDuration?: string;
  replyTo?: {
    id: string;
    content: string;
    sender: string;
  };
  reactions?: string[];
  isEdited?: boolean;
}

const ChatPage = () => {
  const { userId } = useParams();
  const [newMessage, setNewMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock user data
  const user = {
    id: userId,
    name: 'Alice Johnson',
    username: 'alicejohnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop&crop=face',
    isOnline: true,
    lastSeen: 'Online now'
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hey! How are you doing today?',
      timestamp: '10:30 AM',
      isSent: false,
      type: 'text',
    },
    {
      id: '2',
      content: 'I\'m doing great! Just finished a really interesting project at work.',
      timestamp: '10:32 AM',
      isSent: true,
      type: 'text',
    },
    {
      id: '3',
      content: 'That sounds awesome! What kind of project was it?',
      timestamp: '10:33 AM',
      isSent: false,
      type: 'text',
    },
    {
      id: '4',
      content: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop',
      timestamp: '10:35 AM',
      isSent: true,
      type: 'image',
      imageUrl: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=300&fit=crop'
    },
    {
      id: '5',
      content: 'We built this amazing web application using React and modern technologies!',
      timestamp: '10:35 AM',
      isSent: true,
      type: 'text',
      replyTo: {
        id: '3',
        content: 'That sounds awesome! What kind of project was it?',
        sender: 'Alice'
      }
    },
    {
      id: '6',
      content: 'Voice message',
      timestamp: '10:36 AM',
      isSent: false,
      type: 'voice',
      voiceDuration: '0:15'
    }
  ]);

  const emojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isSent: true,
        type: 'text',
        replyTo: replyingTo ? {
          id: replyingTo.id,
          content: replyingTo.content,
          sender: replyingTo.isSent ? 'You' : user.name
        } : undefined
      };
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      setReplyingTo(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const message: Message = {
          id: Date.now().toString(),
          content: 'Image',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSent: true,
          type: 'image',
          imageUrl: reader.result as string
        };
        setMessages(prev => [...prev, message]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Start recording
      toast.success("Recording started");
      setTimeout(() => {
        setIsRecording(false);
        const message: Message = {
          id: Date.now().toString(),
          content: 'Voice message',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isSent: true,
          type: 'voice',
          voiceDuration: '0:' + Math.floor(Math.random() * 60).toString().padStart(2, '0')
        };
        setMessages(prev => [...prev, message]);
        toast.success("Voice message sent");
      }, 2000);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || [];
        const hasReaction = reactions.includes(emoji);
        return {
          ...msg,
          reactions: hasReaction 
            ? reactions.filter(r => r !== emoji)
            : [...reactions, emoji]
        };
      }
      return msg;
    }));
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && message.isSent) {
      setEditingMessage(messageId);
      setEditContent(message.content);
    }
  };

  const handleSaveEdit = () => {
    if (editingMessage && editContent.trim()) {
      setMessages(prev => prev.map(msg => 
        msg.id === editingMessage 
          ? { ...msg, content: editContent.trim(), isEdited: true }
          : msg
      ));
      setEditingMessage(null);
      setEditContent('');
      toast.success("Message edited");
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
    toast.success("Message deleted");
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="p-2">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium">{user.name}</h2>
              <p className="text-sm text-muted-foreground">
                {user.isOnline ? 'Online now' : user.lastSeen}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => toast.success("Voice call started")}>
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => toast.success("Video call started")}>
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] group ${message.isSent ? 'order-2' : 'order-1'}`}>
              {/* Reply Preview */}
              {message.replyTo && (
                <div className={`text-xs p-2 rounded-t-lg border-l-2 ${
                  message.isSent 
                    ? 'bg-primary/10 border-primary ml-8' 
                    : 'bg-muted border-muted-foreground mr-8'
                }`}>
                  <p className="font-medium text-muted-foreground">{message.replyTo.sender}</p>
                  <p className="truncate">{message.replyTo.content}</p>
                </div>
              )}
              
              <div className={`relative p-3 rounded-lg ${
                message.isSent 
                  ? 'bg-primary text-primary-foreground ml-8' 
                  : 'bg-muted mr-8'
              } ${message.replyTo ? 'rounded-tl-none' : ''}`}>
                {message.type === 'text' && (
                  <>
                    {editingMessage === message.id ? (
                      <div className="space-y-2">
                        <Input
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                        />
                        <div className="flex space-x-2">
                          <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingMessage(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <p>{message.content}</p>
                    )}
                  </>
                )}
                
                {message.type === 'image' && (
                  <div className="space-y-2">
                    <img 
                      src={message.imageUrl} 
                      alt="Shared image" 
                      className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(message.imageUrl, '_blank')}
                    />
                  </div>
                )}
                
                {message.type === 'voice' && (
                  <div className="flex items-center space-x-3 min-w-[200px]">
                    <Button variant="ghost" size="sm" className="rounded-full p-2">
                      <div className="w-0 h-0 border-l-[8px] border-l-current border-y-[6px] border-y-transparent" />
                    </Button>
                    <div className="flex-1 h-8 bg-muted-foreground/20 rounded-full relative">
                      <div className="h-full w-1/3 bg-current rounded-full"></div>
                    </div>
                    <span className="text-xs">{message.voiceDuration}</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs opacity-70">{message.timestamp}</span>
                  {message.isEdited && (
                    <span className="text-xs opacity-70">edited</span>
                  )}
                </div>

                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex space-x-1 mt-1">
                    {message.reactions.map((reaction, index) => (
                      <span key={index} className="text-sm">{reaction}</span>
                    ))}
                  </div>
                )}

                {/* Message Actions */}
                <div className={`absolute top-0 ${message.isSent ? '-left-20' : '-right-20'} opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1`}>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <Smile className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <div className="flex space-x-1">
                        {emojis.map(emoji => (
                          <Button
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleReaction(message.id, emoji)}
                          >
                            {emoji}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0"
                    onClick={() => setReplyingTo(message)}
                  >
                    <Reply className="h-3 w-3" />
                  </Button>
                  
                  {message.isSent && (
                    <>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => handleEditMessage(message.id)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => handleDeleteMessage(message.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="p-3 bg-muted border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Replying to {replyingTo.isSent ? 'yourself' : user.name}</p>
              <p className="text-sm text-muted-foreground truncate">{replyingTo.content}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
              <ArrowLeft className="h-4 w-4 rotate-45" />
            </Button>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t border-border bg-card">
        <div className="flex items-end space-x-2">
          <div className="flex space-x-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex-1">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="min-h-[40px]"
            />
          </div>
          
          <div className="flex space-x-1">
            {newMessage.trim() ? (
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                variant={isRecording ? "destructive" : "default"}
                onClick={handleVoiceRecord}
                className={isRecording ? "animate-pulse" : ""}
              >
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
