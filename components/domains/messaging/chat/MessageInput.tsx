'use client';

import React from 'react';
import {
  Send,
  Paperclip,
  Smile,
  Mic,
  Square,
  X,
  ImageIcon,
  FileText,
  File,
  Plus,
  Hash,
  AtSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  conversationId: string;
  disabled?: boolean;
  placeholder?: string;
  allowFileUpload?: boolean;
  allowVoiceRecording?: boolean;
  allowEmoji?: boolean;
  maxLength?: number;
  className?: string;
  onSendMessage?: (content: string, attachments?: File[]) => void;
  onTyping?: (isTyping: boolean) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  disabled = false,
  placeholder = 'Mesajınızı yazın...',
  allowFileUpload = true,
  allowVoiceRecording = true,
  allowEmoji = true,
  maxLength = 2000,
  className,
  onSendMessage,
  onTyping,
}) => {
  const [message, setMessage] = React.useState('');
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingTime, setRecordingTime] = React.useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const imageInputRef = React.useRef<HTMLInputElement>(null);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px
      textarea.style.height = `${newHeight}px`;
    }
  };

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Recording timer
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Handle typing indicator
  const handleTyping = () => {
    if (onTyping) {
      onTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      handleTyping();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if ((!message.trim() && attachments.length === 0) || disabled) return;

    if (onSendMessage) {
      onSendMessage(message.trim(), attachments);
    }

    // Clear input
    setMessage('');
    setAttachments([]);

    // Reset typing indicator
    if (onTyping) {
      onTyping(false);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || !allowFileUpload) return;

    const validFiles = Array.from(files).filter((file) => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        console.error('File too large:', file.name);
        return false;
      }
      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles].slice(0, 5)); // Max 5 files
    setShowAttachmentMenu(false);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    if (!allowVoiceRecording || !navigator.mediaDevices) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        // Create a file-like object instead of using File constructor
        const audioFile = Object.assign(audioBlob, {
          name: `voice-${Date.now()}.wav`,
          lastModified: Date.now(),
        }) as File;
        setAttachments((prev) => [...prev, audioFile]);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingTime(0);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);

      if (newMessage.length <= maxLength) {
        setMessage(newMessage);

        // Set cursor position after emoji
        setTimeout(() => {
          textarea.setSelectionRange(
            start + emoji.length,
            start + emoji.length
          );
          textarea.focus();
        }, 0);
      }
    }
    setShowEmojiPicker(false);
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (file.type.includes('pdf') || file.type.includes('document')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Common emojis for quick access
  const commonEmojis = [
    '😊',
    '😂',
    '❤️',
    '👍',
    '👎',
    '😢',
    '😮',
    '😡',
    '🎉',
    '👏',
    '🙏',
    '💪',
  ];

  return (
    <div className={cn('border-t border-gray-200 bg-white', className)}>
      {/* Drag overlay */}
      {isDragging && (
        <div className="bg-opacity-90 absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed border-blue-400 bg-blue-50">
          <div className="text-center">
            <Plus className="mx-auto mb-2 h-8 w-8 text-blue-600" />
            <p className="font-medium text-blue-700">
              Dosyaları buraya bırakın
            </p>
          </div>
        </div>
      )}

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="border-b border-gray-200 p-3">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-100 p-2"
              >
                {getFileIcon(file)}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  onClick={() => removeAttachment(index)}
                  className="p-1 text-gray-400 transition-colors hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Voice Recording Indicator */}
      {isRecording && (
        <div className="border-b border-gray-200 bg-red-50 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
              <span className="text-sm text-red-700">Ses kaydediliyor</span>
              <span className="font-mono text-sm text-red-600">
                {formatRecordingTime(recordingTime)}
              </span>
            </div>
            <button
              onClick={stopRecording}
              className="p-1 text-red-600 transition-colors hover:text-red-700"
            >
              <Square className="h-4 w-4 fill-current" />
            </button>
          </div>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-20 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <div className="grid grid-cols-6 gap-2">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => insertEmoji(emoji)}
                className="rounded p-2 text-lg transition-colors hover:bg-gray-100"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Menu */}
      {showAttachmentMenu && (
        <div className="absolute bottom-16 left-4 z-20 w-48 rounded-lg border border-gray-200 bg-white py-2 shadow-lg">
          <button
            onClick={() => imageInputRef.current?.click()}
            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <ImageIcon className="h-4 w-4 text-blue-600" />
            Resim
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <FileText className="h-4 w-4 text-green-600" />
            Dosya
          </button>
        </div>
      )}

      {/* Main Input Area */}
      <div
        className="relative p-4"
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex items-end gap-3">
          {/* Attachment Button */}
          {allowFileUpload && (
            <div className="relative">
              <button
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                disabled={disabled}
              >
                <Paperclip className="h-5 w-5" />
              </button>

              {/* Hidden file inputs */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.zip,.rar"
              />
              <input
                ref={imageInputRef}
                type="file"
                multiple
                onChange={(e) => handleFileUpload(e.target.files)}
                className="hidden"
                accept="image/*"
              />
            </div>
          )}

          {/* Text Input */}
          <div className="min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={disabled ? 'Mesaj gönderilemiyor...' : placeholder}
              disabled={disabled}
              rows={1}
              className={cn(
                'w-full resize-none rounded-lg border border-gray-300 px-3 py-2 transition-all focus:border-transparent focus:ring-2 focus:ring-blue-500',
                disabled && 'cursor-not-allowed bg-gray-100'
              )}
              style={{ height: 'auto', minHeight: '42px', maxHeight: '120px' }}
            />

            {/* Character count */}
            {message.length > maxLength * 0.8 && (
              <div className="mt-1 text-right text-xs text-gray-500">
                {message.length}/{maxLength}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Voice Recording */}
            {allowVoiceRecording && !isRecording && (
              <button
                onClick={startRecording}
                className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                disabled={disabled}
              >
                <Mic className="h-5 w-5" />
              </button>
            )}

            {/* Emoji */}
            {allowEmoji && (
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-400 transition-colors hover:text-gray-600"
                disabled={disabled}
              >
                <Smile className="h-5 w-5" />
              </button>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendMessage}
              disabled={
                (!message.trim() && attachments.length === 0) ||
                disabled ||
                isRecording
              }
              className={cn(
                'rounded-lg p-2 transition-colors',
                (message.trim() || attachments.length > 0) &&
                  !disabled &&
                  !isRecording
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'cursor-not-allowed bg-gray-100 text-gray-400'
              )}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        {message.length === 0 && !isRecording && (
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>Hızlı eylemler:</span>
            <button
              onClick={() => insertEmoji('👋')}
              className="rounded bg-gray-100 px-2 py-1 transition-colors hover:bg-gray-200"
            >
              <Hash className="mr-1 inline h-3 w-3" />
              Merhaba
            </button>
            <button
              onClick={() => insertEmoji('🙏')}
              className="rounded bg-gray-100 px-2 py-1 transition-colors hover:bg-gray-200"
            >
              <AtSign className="mr-1 inline h-3 w-3" />
              Teşekkürler
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
