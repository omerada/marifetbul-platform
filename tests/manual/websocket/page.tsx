/**
 * WebSocket Service Test & Example Usage
 *
 * Demonstrates how to use the new STOMP-based WebSocket service
 * for real-time messaging features.
 *
 * @sprint Sprint 5 - Real-time Messaging
 */

'use client';

import { useEffect, useState } from 'react';
import { useStompWebSocket } from '@/hooks/infrastructure/websocket';
import { WebSocketState } from '@/lib/infrastructure/websocket/WebSocketService';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import logger from '@/lib/infrastructure/monitoring/logger';

export default function WebSocketTestPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  // Initialize WebSocket connection
  const {
    state,
    isConnected,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
    error,
  } = useStompWebSocket({
    autoConnect: true,
    onConnect: () => {
      addLog('✅ WebSocket connected');
      logger.info('Connected successfully', { component: 'WebSocketTest' });
    },
    onDisconnect: () => {
      addLog('❌ WebSocket disconnected');
      logger.info('Disconnected', { component: 'WebSocketTest' });
    },
    onError: (err) => {
      addLog(`⚠️ Error: ${err.message}`);
      logger.error('WebSocketTest: Connection error', undefined, {
        error: err,
      });
    },
  });

  // Subscribe to test topic on connect
  useEffect(() => {
    if (!isConnected) return;

    addLog('📡 Subscribing to /topic/test');

    // Subscribe to test topic
    const destination = subscribe('/topic/test', (message) => {
      addLog(`📨 Received: ${JSON.stringify(message)}`);
      setMessages((prev) =>
        [JSON.stringify(message, null, 2), ...prev].slice(0, 10)
      );
    });

    // Cleanup subscription
    return () => {
      addLog('🔌 Unsubscribing from /topic/test');
      unsubscribe(destination);
    };
  }, [isConnected, subscribe, unsubscribe]);

  // Test: Send message
  const handleSendTest = () => {
    try {
      const testMessage = {
        text: 'Hello WebSocket!',
        timestamp: new Date().toISOString(),
      };

      send('/app/test', testMessage);
      addLog(`📤 Sent test message`);
    } catch (err) {
      addLog(
        `❌ Failed to send: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  };

  // Test: Typing indicator start
  const handleTypingStart = () => {
    try {
      send('/app/conversation/test-123/typing/start', {
        userId: 'test-user',
        conversationId: 'test-123',
      });
      addLog('⌨️ Sent typing start');
    } catch (err) {
      addLog(
        `❌ Failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  };

  // Test: Typing indicator stop
  const handleTypingStop = () => {
    try {
      send('/app/conversation/test-123/typing/stop', {
        userId: 'test-user',
        conversationId: 'test-123',
      });
      addLog('⏸️ Sent typing stop');
    } catch (err) {
      addLog(
        `❌ Failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    }
  };

  // Get state badge color
  const getStateBadgeVariant = () => {
    switch (state) {
      case WebSocketState.CONNECTED:
        return 'default';
      case WebSocketState.CONNECTING:
      case WebSocketState.RECONNECTING:
        return 'secondary';
      case WebSocketState.ERROR:
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">WebSocket Test</h1>
          <p className="text-muted-foreground">
            Test STOMP-based WebSocket connection and messaging
          </p>
        </div>

        <Badge variant={getStateBadgeVariant()}>{state}</Badge>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/10 p-4">
          <p className="text-destructive font-medium">Error: {error.message}</p>
        </Card>
      )}

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Connection Control</h2>
        <div className="flex gap-4">
          <Button onClick={connect} disabled={isConnected}>
            Connect
          </Button>
          <Button
            onClick={disconnect}
            variant="destructive"
            disabled={!isConnected}
          >
            Disconnect
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">Test Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={handleSendTest} disabled={!isConnected}>
            Send Test Message
          </Button>
          <Button
            onClick={handleTypingStart}
            disabled={!isConnected}
            variant="outline"
          >
            Typing Start
          </Button>
          <Button
            onClick={handleTypingStop}
            disabled={!isConnected}
            variant="outline"
          >
            Typing Stop
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Activity Log</h2>
          <div className="h-[400px] space-y-2 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No activity yet...
              </p>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="bg-muted rounded p-2 font-mono text-sm"
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Received Messages</h2>
          <div className="h-[400px] space-y-2 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No messages received...
              </p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className="bg-muted overflow-x-auto rounded p-3 font-mono text-xs"
                >
                  <pre>{msg}</pre>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Backend Endpoints Available
        </h2>
        <div className="space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-muted rounded p-2 font-mono">/ws</div>
            <div className="text-muted-foreground">
              WebSocket endpoint (SockJS)
            </div>

            <div className="bg-muted rounded p-2 font-mono">
              /app/conversation/{'{id}'}/typing/start
            </div>
            <div className="text-muted-foreground">Send typing indicator</div>

            <div className="bg-muted rounded p-2 font-mono">
              /topic/conversation/{'{id}'}/typing
            </div>
            <div className="text-muted-foreground">
              Subscribe to typing events
            </div>

            <div className="bg-muted rounded p-2 font-mono">
              /topic/user/{'{userId}'}/messages
            </div>
            <div className="text-muted-foreground">
              Subscribe to new messages
            </div>

            <div className="bg-muted rounded p-2 font-mono">
              /queue/user/{'{userId}'}/private
            </div>
            <div className="text-muted-foreground">Private messages queue</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
