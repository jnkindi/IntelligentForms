'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface DeleteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formId: number;
  formTitle: string;
}

export default function DeleteFormModal({
  isOpen,
  onClose,
  formId,
  formTitle,
}: DeleteFormModalProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete form');
      }

      toast.success('Form deleted successfully');
      onClose();
      router.refresh();
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Form" size="md">
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-700">
              Are you sure you want to delete{' '}
              <span className="font-semibold">"{formTitle}"</span>?
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone. All submissions and data associated
              with this form will be permanently deleted.
            </p>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          isLoading={isDeleting}
        >
          Delete Form
        </Button>
      </ModalFooter>
    </Modal>
  );
}
