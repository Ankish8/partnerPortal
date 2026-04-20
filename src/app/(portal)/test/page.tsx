"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FlaskConical, Send, RotateCcw, Settings2, CheckCircle2 } from "lucide-react";
import { ContentPanel } from "@/components/layout/content-panel";
import { useState } from "react";

interface Message { id: string; role: "user" | "bot"; content: string; timestamp: string }

const mockConversation: Message[] = [
  { id: "1", role: "bot", content: "Hello! Welcome to our service. How can I help you today?", timestamp: "10:00 AM" },
  { id: "2", role: "user", content: "I'd like to book an appointment for next Tuesday", timestamp: "10:01 AM" },
  { id: "3", role: "bot", content: "I'd be happy to help you book an appointment! What time works best for you on Tuesday?", timestamp: "10:01 AM" },
  { id: "4", role: "user", content: "Around 2 PM would be great", timestamp: "10:02 AM" },
  { id: "5", role: "bot", content: "2 PM on Tuesday works. Which service would you like to book?", timestamp: "10:02 AM" },
];

export default function TestPage() {
  const [messages, setMessages] = useState<Message[]>(mockConversation);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: input, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "bot", content: "Thanks! Let me process that for you...", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }]);
    }, 1000);
  };

  return (
    <ContentPanel>
    <div className="flex h-full">
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-5 w-5 text-primary" />
            <div>
              <h1 className="font-serif text-[24px] leading-[1.2] tracking-[-0.03em]">Test Agent</h1>
              <p className="text-xs text-muted-foreground">WhatsApp chat simulator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setMessages([])}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
            <Button size="sm" variant="outline">
              <Settings2 className="h-3.5 w-3.5 mr-1" /> Settings
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#e5ddd5] p-6">
          <div className="mx-auto max-w-lg space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${msg.role === "user" ? "bg-[#dcf8c6]" : "bg-white"}`}>
                  <p className="text-sm">{msg.content}</p>
                  <div className="mt-1 flex items-center justify-end gap-1">
                    <span className="text-[10px] text-muted-foreground">{msg.timestamp}</span>
                    {msg.role === "user" && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t bg-card px-6 py-4">
          <div className="mx-auto flex max-w-lg gap-3">
            <Input placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} className="flex-1" />
            <Button size="icon" onClick={handleSend}><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>

      <ScrollArea className="w-[300px] border-l bg-card">
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold">Debug Panel</h3>
          <p className="text-xs text-muted-foreground">Real-time analysis of the conversation</p>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Intent Detected</h4>
            <Card><CardContent className="p-3">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500" /><span className="text-sm font-medium">Appointment Booking</span></div>
              <p className="mt-1 text-xs text-muted-foreground">Confidence: 92%</p>
            </CardContent></Card>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Current Flow Step</h4>
            <Card><CardContent className="p-3">
              <p className="text-sm font-medium">Collect: Service Type</p>
              <p className="mt-1 text-xs text-muted-foreground">Step 3 of 5</p>
            </CardContent></Card>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Data Collected</h4>
            <div className="space-y-2">
              <Card><CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Preferred Date</p>
                <p className="text-sm font-medium">Tuesday, 2:00 PM</p>
              </CardContent></Card>
              <Card className="border-dashed"><CardContent className="p-3">
                <p className="text-xs text-muted-foreground">Service Type</p>
                <p className="text-sm text-muted-foreground italic">Waiting for input...</p>
              </CardContent></Card>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Knowledge Used</h4>
            <Card><CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Source: Website</p>
              <p className="text-sm">Business hours and appointment availability</p>
            </CardContent></Card>
          </div>
        </div>
      </ScrollArea>
    </div>
    </ContentPanel>
  );
}
