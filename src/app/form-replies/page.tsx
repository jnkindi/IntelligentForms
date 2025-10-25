import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { ArrowLeft, Calendar, User, Download, FileText, FileSpreadsheet, TrendingUp, Clock } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import ExportButtons from '@/components/forms/ExportButtons';
import SubmissionAnalytics from '@/components/forms/SubmissionAnalytics';

async function getFormWithReplies(formId: number, userId: number) {
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

  return form;
}

export default async function FormRepliesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const formId = searchParams.id ? parseInt(searchParams.id as string) : null;

  if (!formId) {
    redirect('/manage-forms');
  }

  const userId = parseInt(session.user.id);
  const form = await getFormWithReplies(formId, userId);

  if (!form) {
    redirect('/manage-forms');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/manage-forms">
            <Button variant="ghost" size="sm" className="mb-4 hover:bg-primary-50 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Forms
            </Button>
          </Link>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">
                  {form.title}
                </h1>
              </div>
              <div className="flex items-center gap-2 ml-14">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">
                    {form.replies.length} submission{form.replies.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {form.type && (
                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                    form.type === 'SURVEY'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {form.type}
                  </span>
                )}
              </div>
            </div>
            {form.replies.length > 0 && (
              <div className="flex items-center gap-3">
                <ExportButtons formId={form.id} formTitle={form.title} />
              </div>
            )}
          </div>
        </div>

        {/* Analytics */}
        {form.replies.length > 0 && (
          <div className="mb-8">
            <SubmissionAnalytics form={form} />
          </div>
        )}

        {/* Submissions */}
        {form.replies.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">All Submissions</h2>
            </div>
            {form.replies.map((replier, index) => (
              <Card key={replier.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <div className="bg-gradient-to-r from-primary-50 via-primary-50 to-transparent px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg shadow-md">
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">
                          Submission #{form.replies.length - index}
                        </h3>
                        {replier.ipAddress && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            IP: {replier.ipAddress}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg shadow-sm">
                      <Calendar className="h-4 w-4 text-primary-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {formatDate(replier.date)}
                      </span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 gap-5">
                    {form.fields.map((field) => {
                      const reply = replier.replies.find(
                        (r) => r.fieldId === field.id
                      );
                      return (
                        <div key={field.id} className="group">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mt-0.5 group-hover:scale-110 transition-transform">
                              <User className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                {field.field}
                                {field.required && (
                                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                    Required
                                  </span>
                                )}
                              </p>
                              <div className="bg-gradient-to-r from-gray-50 to-transparent px-4 py-3 rounded-lg border border-gray-200">
                                <p className="text-gray-900 font-medium">
                                  {reply?.answer || (
                                    <span className="text-gray-400 italic font-normal">
                                      No answer provided
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-16 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <User className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No submissions yet
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  Share your form to start collecting responses from users
                </p>
                <Link href="/manage-forms">
                  <Button variant="primary" size="lg" className="shadow-lg shadow-primary-500/30">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Forms
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
