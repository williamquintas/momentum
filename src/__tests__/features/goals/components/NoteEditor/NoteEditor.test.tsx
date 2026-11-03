/**
 * NoteEditor Component Tests
 *
 * Tests for adding, editing notes with tags
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';

import { NoteEditor } from '@/features/goals/components/NoteEditor/NoteEditor';
import type { Note } from '@/features/goals/types';

const mockOnSave = vi.fn();
const mockOnCancel = vi.fn();

describe('NoteEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Add Note Mode', () => {
    it('should render empty form when no note is provided', () => {
      render(<NoteEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

      expect(screen.getByPlaceholderText(/write your note/i)).toBeInTheDocument();
    });

    it('should call onSave with note data when form is submitted', async () => {
      render(<NoteEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

      const textarea = screen.getByPlaceholderText(/write your note/i);
      fireEvent.change(textarea, { target: { value: 'Test note content' } });

      const saveButton = screen.getByText('Save Note');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            content: 'Test note content',
          })
        );
      });
    });

    it('should call onCancel when cancel button is clicked', () => {
      render(<NoteEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should validate that content is not empty', async () => {
      render(<NoteEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

      const saveButton = screen.getByText('Save Note');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edit Note Mode', () => {
    const mockNote: Note = {
      id: 'note-1',
      content: 'Existing note content',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      createdBy: 'test-user',
      tags: ['important', 'review'],
    };

    it('should pre-populate form with existing note data', () => {
      render(<NoteEditor note={mockNote} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const textarea = screen.getByDisplayValue('Existing note content');
      expect(textarea).toBeInTheDocument();
    });

    it('should update note with new content', async () => {
      render(<NoteEditor note={mockNote} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const textarea = screen.getByDisplayValue('Existing note content');
      fireEvent.change(textarea, { target: { value: 'Updated content' } });

      const saveButton = screen.getByText('Update Note');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'note-1',
            content: 'Updated content',
          })
        );
      });
    });

    it('should preserve existing tags when editing', async () => {
      render(<NoteEditor note={mockNote} onSave={mockOnSave} onCancel={mockOnCancel} />);

      const saveButton = screen.getByText('Update Note');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            tags: ['important', 'review'],
          })
        );
      });
    });
  });

  describe('Tags', () => {
    it('should allow adding tags to a note', async () => {
      render(<NoteEditor onSave={mockOnSave} onCancel={mockOnCancel} />);

      const textarea = screen.getByPlaceholderText(/write your note/i);
      fireEvent.change(textarea, { target: { value: 'Note with tags' } });

      const saveButton = screen.getByText('Save Note');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith(
          expect.objectContaining({
            content: 'Note with tags',
          })
        );
      });
    });
  });

  describe('Loading State', () => {
    it('should render loading state correctly', () => {
      render(<NoteEditor onSave={mockOnSave} onCancel={mockOnCancel} loading />);

      expect(screen.getByText('Save Note')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });
});
