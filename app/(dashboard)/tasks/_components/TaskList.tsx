'use client';

import { useState } from 'react';
import { Loader2, ClipboardList, Plus } from 'lucide-react';
import { Button }     from '@/components/ui/button';
import { Skeleton }   from '@/components/ui/skeleton';
import TaskCard       from './TaskCard';
import type { Task } from '@/types/task.types';

interface TaskListProps {
  tasks:      Task[];
  isLoading:  boolean;
  isFetching?: boolean;
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onEdit:     (task: Task) => void;
  onCreateNew: () => void;
  emptyLabel?: string;
}

export default function TaskList({
  tasks, isLoading, isFetching, totalPages, currentPage,
  onPageChange, onEdit, onCreateNew, emptyLabel = 'No tasks found',
}: TaskListProps) {

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-2.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border rounded-lg p-4 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (!tasks.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <ClipboardList className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-1">{emptyLabel}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-xs">
          Create a task to start tracking your work and get automated reminders.
        </p>
        <Button onClick={onCreateNew} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Fetching indicator */}
      {isFetching && !isLoading && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Task cards */}
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} onEdit={onEdit} />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {[...Array(Math.min(totalPages, 5))].map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`h-8 w-8 rounded text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-muted-foreground'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            {totalPages > 5 && (
              <span className="text-muted-foreground text-sm px-1">...</span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}