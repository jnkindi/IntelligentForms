import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/database';
import jsPDF from 'jspdf';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formId = parseInt(params.id);
    const userId = parseInt(session.user.id);

    // Get form with replies
    const form = await prisma.form.findFirst({
      where: { id: formId, userId },
      include: {
        fields: {
          orderBy: { order: 'asc' },
        },
        replies: {
          include: {
            replies: {
              include: {
                field: true,
              },
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!form) {
      return NextResponse.json({ error: 'Form not found' }, { status: 404 });
    }

    // Create PDF using jsPDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper function to check if we need a new page
    const checkNewPage = (height: number) => {
      if (yPosition + height > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with wrapping
    const addText = (text: string, fontSize: number, isBold: boolean = false, indent: number = 0) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');

      const maxWidth = pageWidth - (2 * margin) - indent;
      const lines = doc.splitTextToSize(text, maxWidth);

      lines.forEach((line: string) => {
        checkNewPage(fontSize / 2);
        doc.text(line, margin + indent, yPosition);
        yPosition += fontSize / 2;
      });
    };

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(form.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Metadata
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Submissions: ${form.replies.length}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 7;
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Add each submission
    form.replies.forEach((replier, index) => {
      // Check if we need a new page for this submission
      checkNewPage(50);

      // Submission header
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(`Submission #${replier.id}`, margin, yPosition);
      yPosition += 10;

      // Submission details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text(`Date: ${new Date(replier.date).toLocaleString()}`, margin, yPosition);
      yPosition += 6;
      doc.text(`IP Address: ${replier.ipAddress || 'N/A'}`, margin, yPosition);
      yPosition += 10;

      // Add fields and answers
      form.fields.forEach((field) => {
        const reply = replier.replies.find((r) => r.fieldId === field.id);

        checkNewPage(20);

        // Field name
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(55, 65, 81);
        doc.text(`${field.field}${field.required ? ' *' : ''}:`, margin, yPosition);
        yPosition += 7;

        // Answer
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(31, 41, 55);
        addText(reply?.answer || 'No answer provided', 10, false, 10);
        yPosition += 5;
      });

      // Add separator between submissions
      if (index < form.replies.length - 1) {
        checkNewPage(10);
        doc.setDrawColor(229, 231, 235);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      }
    });

    // Get PDF as buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    // Return PDF file
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${form.title
          .replace(/[^a-z0-9]/gi, '_')
          .toLowerCase()}_submissions_${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error('PDF export error:', error);
    return NextResponse.json(
      { error: 'Failed to export PDF', details: error.message },
      { status: 500 }
    );
  }
}
