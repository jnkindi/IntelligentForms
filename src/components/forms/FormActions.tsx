'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Copy, Code, Eye, EyeOff, Trash2, Webhook, MoreVertical, FileText, ExternalLink, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFormPublicUrl } from '@/lib/utils';
import EmbedCodeModal from './EmbedCodeModal';
import DeleteFormModal from './DeleteFormModal';

interface FormActionsProps {
  formId: number;
  formTitle: string;
  status: string;
  identifierhash: string;
  appUrl: string;
}

export default function FormActions({
  formId,
  formTitle,
  status,
  identifierhash,
  appUrl,
}: FormActionsProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.right + window.scrollX - 224, // 224px = w-56
        });
      }
    };

    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  const handleToggleStatus = async () => {
    setIsOpen(false);
    setIsUpdating(true);
    try {
      const newStatus = status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update form status');
      }

      toast.success(`Form ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'} successfully`);
      router.refresh();
    } catch (error) {
      console.error('Error updating form:', error);
      toast.error('Failed to update form status');
    } finally {
      setIsUpdating(false);
    }
  };

  const copyPublicUrl = () => {
    const url = getFormPublicUrl(identifierhash, appUrl);
    navigator.clipboard.writeText(url);
    toast.success('Public URL copied to clipboard!');
    setIsOpen(false);
  };

  return (
    <>
      <div ref={buttonRef}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2"
          disabled={isUpdating}
        >
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>

      {mounted && isOpen && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
        >
          <Link
            href={`/form-replies?id=${formId}`}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <FileText className="h-4 w-4 mr-3" />
            View Submissions
          </Link>

          <a
            href={`${appUrl}/f/${identifierhash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <ExternalLink className="h-4 w-4 mr-3" />
            Open Form
          </a>

          <Link
            href={`/api-logs?id=${formId}`}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <BarChart3 className="h-4 w-4 mr-3" />
            API Logs
          </Link>

          <div className="border-t border-gray-200 my-1"></div>

          <button
            onClick={copyPublicUrl}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Copy className="h-4 w-4 mr-3" />
            Copy Link
          </button>

          <button
            onClick={() => {
              setShowEmbedModal(true);
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Code className="h-4 w-4 mr-3" />
            Embed Code
          </button>

          <Link
            href={`/save-data-externally?id=${formId}`}
            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            <Webhook className="h-4 w-4 mr-3" />
            External API
          </Link>

          <div className="border-t border-gray-200 my-1"></div>

          <button
            onClick={handleToggleStatus}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            {status === 'ACTIVE' ? (
              <>
                <EyeOff className="h-4 w-4 mr-3" />
                Deactivate
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-3" />
                Activate
              </>
            )}
          </button>

          <button
            onClick={() => {
              setShowDeleteModal(true);
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-3" />
            Delete
          </button>
        </div>,
        document.body
      )}

      <EmbedCodeModal
        isOpen={showEmbedModal}
        onClose={() => setShowEmbedModal(false)}
        identifierhash={identifierhash}
        appUrl={appUrl}
      />

      <DeleteFormModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        formId={formId}
        formTitle={formTitle}
      />
    </>
  );
}
