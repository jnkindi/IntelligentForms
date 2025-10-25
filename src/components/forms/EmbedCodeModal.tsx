'use client';

import { useState } from 'react';
import Modal, { ModalFooter } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { Copy, Check } from 'lucide-react';
import { getFormEmbedCode } from '@/lib/utils';
import toast from 'react-hot-toast';

interface EmbedCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  identifierhash: string;
  appUrl: string;
}

export default function EmbedCodeModal({
  isOpen,
  onClose,
  identifierhash,
  appUrl,
}: EmbedCodeModalProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = getFormEmbedCode(identifierhash, appUrl);

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success('Embed code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Embed Form in Your Website"
      size="lg"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Copy and paste this code into your website's HTML to embed your form:
        </p>

        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{embedCode}</code>
          </pre>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4 text-gray-400" />
            )}
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            Customization Options
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Adjust <code className="bg-blue-100 px-1 rounded">width</code> and <code className="bg-blue-100 px-1 rounded">height</code> attributes as needed</li>
            <li>• The form will automatically adapt to mobile devices</li>
            <li>• All submissions will appear in your dashboard</li>
          </ul>
        </div>
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleCopy}>
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </>
          )}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
