'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Download, FileText, FileSpreadsheet } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExportButtonsProps {
  formId: number;
  formTitle: string;
}

export default function ExportButtons({ formId, formTitle }: ExportButtonsProps) {
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportCsv = async () => {
    setIsExportingCsv(true);
    try {
      const response = await fetch(`/api/forms/${formId}/export/csv`);

      if (!response.ok) {
        throw new Error('Failed to export CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_submissions_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('CSV exported successfully!');
    } catch (error: any) {
      console.error('CSV export error:', error);
      toast.error('Failed to export CSV');
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const response = await fetch(`/api/forms/${formId}/export/pdf`);

      if (!response.ok) {
        throw new Error('Failed to export PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_submissions_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF exported successfully!');
    } catch (error: any) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="flex gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCsv}
        isLoading={isExportingCsv}
        className="flex items-center"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPdf}
        isLoading={isExportingPdf}
        className="flex items-center"
      >
        <FileText className="h-4 w-4 mr-2" />
        Export PDF
      </Button>
    </div>
  );
}
