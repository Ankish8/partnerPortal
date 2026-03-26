"use client";

import { Button, Card, Chip, Input, Avatar } from "@heroui/react";
import {
  FlaskConical,
  Send,
  Bot,
  User,
  RotateCcw,
  Settings2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: string;
  intentDetected?: string;
  flowStep?: string;
}

const mockConversation: Message[] = [
  {
    id: "1",
    role: "bot",
    content: "Hello! Welcome to our service. How can I help you today?",
    timestamp: "10:00 AM",
  },
  {
    id: "2",
    role: "user",
    content: "I'd like to book an appointment for next Tuesday",
    timestamp: "10:01 AM",
    intentDetected: "Appointment Booking",
  },
  {
    id: "3",
    role: "bot",
    content: "I'd be happy to help you book an appointment! What time works best for you on Tuesday?",
    timestamp: "10:01 AM",
    flowStep: "Collect: Preferred Date",
  },
  {
    id: "4",
    role: "user",
    content: "Around 2 PM would be great",
    timestamp: "10:02 AM",
  },
  {
    id: "5",
    role: "bot",
    content: "2 PM on Tuesday works. Which service would you like to book?",
    timestamp: "10:02 AM",
    flowStep: "Collect: Service Type",
  },
];

export default function TestPage() {
  const [messages, setMessages] = useState<Message[]>(mockConversation);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: "Thanks! Let me process that for you...",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1000);
  };

  return (
    <div className="flex h-full">
      {/* Chat simulator */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-separator px-6 py-4">
          <div className="flex items-center gap-3">
            <FlaskConical className="h-5 w-5 text-accent" />
            <div>
              <h1 className="text-lg font-bold text-foreground">Test Agent</h1>
              <p className="text-xs text-muted">WhatsApp chat simulator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onPress={() => setMessages([])}>
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
            <Button size="sm" variant="outline">
              <Settings2 className="h-3.5 w-3.5" />
              Settings
            </Button>
          </div>
        </div>

        {/* Chat area - WhatsApp style */}
        <div className="flex-1 overflow-y-auto bg-[#e5ddd5] p-6">
          <div className="mx-auto max-w-lg space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${
                    msg.role === "user"
                      ? "bg-[#dcf8c6] text-foreground"
                      : "bg-white text-foreground"
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <div className="mt-1 flex items-center justify-end gap-1">
                    <span className="text-[10px] text-muted">{msg.timestamp}</span>
                    {msg.role === "user" && <CheckCircle2 className="h-3 w-3 text-blue-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-separator bg-surface px-6 py-4">
          <div className="mx-auto flex max-w-lg gap-3">
            <Input
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1"
            />
            <Button onPress={handleSend} isIconOnly>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Debug panel */}
      <div className="w-[300px] border-l border-separator bg-surface overflow-y-auto">
        <div className="p-4 border-b border-separator">
          <h3 className="text-sm font-semibold text-foreground">Debug Panel</h3>
          <p className="text-xs text-muted">Real-time analysis of the conversation</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Intent detection */}
          <div>
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Intent Detected</h4>
            <Card className="p-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm font-medium text-foreground">Appointment Booking</span>
              </div>
              <p className="mt-1 text-xs text-muted">Confidence: 92%</p>
            </Card>
          </div>

          {/* Current flow step */}
          <div>
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Current Flow Step</h4>
            <Card className="p-3">
              <p className="text-sm font-medium text-foreground">Collect: Service Type</p>
              <p className="mt-1 text-xs text-muted">Step 3 of 5</p>
            </Card>
          </div>

          {/* Data collected */}
          <div>
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Data Collected</h4>
            <div className="space-y-2">
              <Card className="p-3">
                <p className="text-xs text-muted">Preferred Date</p>
                <p className="text-sm font-medium text-foreground">Tuesday, 2:00 PM</p>
              </Card>
              <Card className="p-3 border-dashed border-2">
                <p className="text-xs text-muted">Service Type</p>
                <p className="text-sm text-muted italic">Waiting for input...</p>
              </Card>
            </div>
          </div>

          {/* Knowledge used */}
          <div>
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Knowledge Used</h4>
            <Card className="p-3">
              <p className="text-xs text-muted">Source: Website</p>
              <p className="text-sm text-foreground">Business hours and appointment availability</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
