import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/database';

export async function POST(
  request: NextRequest,
  { params }: { params: { hash: string } }
) {
  try {
    const { hash } = params;
    const body = await request.json();
    const { answers } = body;

    // Find the form
    const form = await prisma.form.findFirst({
      where: {
        identifierhash: hash,
        status: 'ACTIVE',
      },
      include: {
        fields: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { message: 'Form not found or is inactive' },
        { status: 404 }
      );
    }

    // Get IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ipAddress = forwarded ? forwarded.split(',')[0] : request.ip || null;
    const userAgent = request.headers.get('user-agent');

    // Create replier and replies in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create replier
      const replier = await tx.formReplier.create({
        data: {
          formId: form.id,
          date: new Date(),
          ipAddress,
          userAgent,
        },
      });

      // Create replies for each field
      const replies = [];
      for (const field of form.fields) {
        const answer = answers[field.id];
        if (answer !== undefined && answer !== null && answer !== '') {
          const answerValue = Array.isArray(answer)
            ? answer.join(', ')
            : String(answer);

          replies.push({
            replierId: replier.id,
            fieldId: field.id,
            answer: answerValue,
          });
        }
      }

      if (replies.length > 0) {
        await tx.formReply.createMany({
          data: replies,
        });
      }

      return replier;
    });

    // If form has external API configured, send data
    const externalApis = await prisma.externalApi.findMany({
      where: {
        formId: form.id,
        enabled: true,
      },
      include: {
        fields: {
          include: {
            field: true,
          },
        },
      },
    });

    for (const api of externalApis) {
      let logData: {
        externalApiId: number;
        replierId: number;
        requestPayload?: string;
        responseStatus?: number;
        responseBody?: string;
        errorMessage?: string;
      } = {
        externalApiId: api.id,
        replierId: result.id,
      };

      try {
        const payload: Record<string, any> = {};
        for (const mapping of api.fields) {
          const answer = answers[mapping.fieldId];
          if (answer !== undefined && answer !== null) {
            payload[mapping.externalFieldName] = answer;
          }
        }

        logData.requestPayload = JSON.stringify(payload);

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (api.headers) {
          try {
            const customHeaders = JSON.parse(api.headers);
            Object.assign(headers, customHeaders);
          } catch (e) {
            console.error('Failed to parse headers:', e);
            logData.errorMessage = 'Failed to parse custom headers';
          }
        }

        const response = await fetch(api.url, {
          method: api.method,
          headers,
          body: api.method !== 'GET' ? JSON.stringify(payload) : undefined,
        });

        logData.responseStatus = response.status;

        // Try to get response body (limit to prevent huge logs)
        try {
          const responseText = await response.text();
          logData.responseBody = responseText.substring(0, 5000); // Limit to 5000 chars
        } catch (e) {
          logData.responseBody = 'Failed to read response body';
        }

        if (!response.ok) {
          logData.errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (error: any) {
        console.error('Error sending to external API:', error);
        logData.errorMessage = error.message || 'Unknown error occurred';
        logData.responseStatus = 0;
      } finally {
        // Always log the API call attempt
        try {
          await prisma.externalApiLog.create({
            data: logData,
          });
        } catch (logError) {
          console.error('Failed to create API log:', logError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      data: { replierId: result.id },
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
