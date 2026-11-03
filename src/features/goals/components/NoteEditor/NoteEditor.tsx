/**
 * NoteEditor Component
 *
 * Form component for adding and editing notes with optional tags.
 * Responsive: Modal on desktop, Drawer on mobile.
 */

import React, { useState, useEffect } from 'react';

import { Button, Input, Modal, Drawer, Space, Typography, message } from 'antd';
import { useTranslation } from 'react-i18next';

import type { Note } from '@/features/goals/types';

const { TextArea } = Input;
const { Text } = Typography;

export interface NoteEditorProps {
  note?: Note;
  open?: boolean;
  onSave: (note: { id?: string; content: string; tags?: string[] }) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isMobile?: boolean;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({
  note,
  open = true,
  onSave,
  onCancel,
  loading = false,
  isMobile = false,
}) => {
  const { t } = useTranslation();
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = !!note;

  useEffect(() => {
    if (note) {
      setContent(note.content);
      setTags(note.tags || []);
    } else {
      setContent('');
      setTags([]);
    }
    setTagInput('');
  }, [note, open]);

  const handleSave = async () => {
    if (!content.trim()) {
      message.error(t('note.validation.contentRequired'));
      return;
    }

    setSaving(true);
    try {
      await onSave({
        id: note?.id,
        content: content.trim(),
        tags: tags.length > 0 ? tags : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const isDisabled = loading || saving;

  const formContent = (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <TextArea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t('note.placeholder.content')}
        rows={4}
        maxLength={5000}
        showCount
        disabled={isDisabled}
      />

      <div>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>
          {t('note.labels.tags')}
        </Text>
        <Space.Compact style={{ width: '100%', marginBottom: 8 }}>
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagInputKeyDown}
            placeholder={t('note.placeholder.tag')}
            disabled={isDisabled}
          />
          <Button onClick={handleAddTag} disabled={!tagInput.trim() || isDisabled}>
            {t('note.actions.addTag')}
          </Button>
        </Space.Compact>
        {tags.length > 0 && (
          <Space wrap>
            {tags.map((tag) => (
              <Button
                key={tag}
                type="text"
                onClick={() => handleRemoveTag(tag)}
                disabled={isDisabled}
                style={{ padding: '2px 8px' }}
              >
                {tag} ×
              </Button>
            ))}
          </Space>
        )}
      </div>

      <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
        <Button onClick={onCancel} disabled={isDisabled}>
          {t('common.cancel')}
        </Button>
        <Button
          type="primary"
          onClick={() => {
            void handleSave();
          }}
          loading={saving}
          disabled={isDisabled}
        >
          {isEditing ? t('note.actions.update') : t('note.actions.save')}
        </Button>
      </Space>
    </Space>
  );

  if (isMobile) {
    return (
      <Drawer
        title={isEditing ? t('note.title.edit') : t('note.title.add')}
        placement="bottom"
        onClose={onCancel}
        open={open}
        height="60vh"
        extra={
          <Space>
            <Button onClick={onCancel} disabled={isDisabled}>
              {t('common.cancel')}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                void handleSave();
              }}
              loading={saving}
              disabled={isDisabled}
            >
              {isEditing ? t('note.actions.update') : t('note.actions.save')}
            </Button>
          </Space>
        }
      >
        {formContent}
      </Drawer>
    );
  }

  return (
    <Modal
      title={isEditing ? t('note.title.edit') : t('note.title.add')}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={500}
    >
      {formContent}
    </Modal>
  );
};
