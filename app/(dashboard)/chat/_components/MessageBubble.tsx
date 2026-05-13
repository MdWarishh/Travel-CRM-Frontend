'use client';

import { Check, CheckCheck, ExternalLink, FileText } from 'lucide-react';
import { Message } from '@/types/chat';
import { UserAvatar } from './UserAvatar';
import { format, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface Props {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  showDateDivider?: boolean;
  dividerDate?: string;
}

export function MessageBubble({ message, isOwn, showAvatar, showDateDivider, dividerDate }: Props) {
  const router = useRouter();
  const isSystem = message.messageType === 'SYSTEM';
  const isTask = message.messageType === 'TASK';
  const isFile = message.messageType === 'FILE' || message.messageType === 'IMAGE';
  const time = format(new Date(message.createdAt), 'h:mm a');

  const ReadIcon = () => {
    if (!isOwn) return null;
    if (message.status === 'READ') return <CheckCheck className="h-3 w-3 text-blue-500" />;
    if (message.status === 'DELIVERED') return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    return <Check className="h-3 w-3 text-muted-foreground" />;
  };

  // System message
  if (isSystem) {
    return (
      <>
        {showDateDivider && <DateDivider date={dividerDate!} />}
        <div className="flex justify-center my-2">
          <span className="text-[11px] bg-muted text-muted-foreground px-3 py-1 rounded-full">
            {message.messageText}
          </span>
        </div>
      </>
    );
  }

  // Task message
  if (isTask) {
    const meta = message.metadata || {};
    return (
      <>
        {showDateDivider && <DateDivider date={dividerDate!} />}
        <div className={cn('flex gap-2 mb-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          {!isOwn && showAvatar ? (
            <UserAvatar name={message.sender.name} image={message.sender.profileImage} size="sm" className="shrink-0 mt-auto mb-1" />
          ) : (
            <div className="w-7 shrink-0" />
          )}
          <div
            className={cn(
              'max-w-[70%] rounded-xl border p-3 cursor-pointer hover:shadow-sm transition-shadow',
              'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800'
            )}
            onClick={() => meta.leadId && router.push(`/leads/${meta.leadId}`)}
          >
            <div className="flex items-start gap-2 mb-1.5">
              <span className="text-amber-600 text-base leading-none mt-0.5">📋</span>
              <div>
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-300">Task Assigned</p>
                <p className="text-sm text-foreground font-medium">{meta.taskTitle || message.messageText}</p>
              </div>
            </div>
            {meta.taskDueAt && (
              <p className="text-[11px] text-amber-700 dark:text-amber-400 ml-6">
                Due: {format(new Date(meta.taskDueAt), 'MMM d, h:mm a')}
              </p>
            )}
            {(meta.leadId) && (
              <div className="flex items-center gap-1 mt-2 ml-6">
                <ExternalLink className="h-3 w-3 text-amber-600" />
                <span className="text-[11px] text-amber-700 font-medium">Click to view</span>
              </div>
            )}
            <div className="flex justify-end items-center gap-1 mt-1.5">
              <span className="text-[10px] text-amber-700/60">{time}</span>
              <ReadIcon />
            </div>
          </div>
        </div>
      </>
    );
  }

  // File / image message
  if (isFile && message.attachmentUrl) {
    const isImage = message.messageType === 'IMAGE';
    return (
      <>
        {showDateDivider && <DateDivider date={dividerDate!} />}
        <div className={cn('flex gap-2 mb-1', isOwn ? 'flex-row-reverse' : 'flex-row')}>
          {!isOwn && showAvatar ? (
            <UserAvatar name={message.sender.name} image={message.sender.profileImage} size="sm" className="shrink-0 mt-auto mb-1" />
          ) : (
            <div className="w-7 shrink-0" />
          )}
          <div className={cn('max-w-[65%] rounded-xl overflow-hidden', isOwn ? 'bg-primary' : 'bg-card border border-border')}>
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={message.attachmentUrl}
                alt="attachment"
                className="max-w-full rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                onClick={() => window.open(message.attachmentUrl!, '_blank')}
              />
            ) : (
              <a
                href={message.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5"
              >
                <FileText className={cn('h-5 w-5 shrink-0', isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground')} />
                <span className={cn('text-sm font-medium truncate', isOwn ? 'text-primary-foreground' : 'text-foreground')}>
                  {message.messageText || 'File attachment'}
                </span>
              </a>
            )}
            <div className={cn('flex justify-end items-center gap-1 px-2 pb-1.5', isImage ? '-mt-6' : 'mt-0')}>
              <span className={cn('text-[10px]', isOwn ? 'text-primary-foreground/60' : 'text-muted-foreground')}>{time}</span>
              <ReadIcon />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Normal text message
  return (
    <>
      {showDateDivider && <DateDivider date={dividerDate!} />}
      <div className={cn('flex gap-2 mb-1 group', isOwn ? 'flex-row-reverse' : 'flex-row')}>
        {!isOwn && showAvatar ? (
          <UserAvatar
            name={message.sender.name}
            image={message.sender.profileImage}
            size="sm"
            className="shrink-0 mt-auto mb-1"
          />
        ) : (
          <div className="w-7 shrink-0" />
        )}

        <div className="flex flex-col gap-0.5 max-w-[70%]">
          {!isOwn && showAvatar && (
            <span className="text-[11px] text-muted-foreground ml-1 font-medium">
              {message.sender.name}
            </span>
          )}
          <div className={cn(
            'px-3 py-2 rounded-2xl text-sm leading-relaxed break-words',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-card border border-border text-foreground rounded-bl-sm'
          )}>
            {message.messageText}
          </div>
          <div className={cn('flex items-center gap-1 px-1', isOwn ? 'justify-end' : 'justify-start')}>
            <span className="text-[10px] text-muted-foreground">{time}</span>
            <ReadIcon />
          </div>
        </div>
      </div>
    </>
  );
}

function DateDivider({ date }: { date: string }) {
  const d = new Date(date);
  const label = isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : format(d, 'MMMM d, yyyy');
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-[11px] text-muted-foreground font-medium px-2 shrink-0">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}