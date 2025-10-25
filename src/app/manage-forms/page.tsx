import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/database';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import {
  Copy,
  Eye,
  EyeOff,
  FileText,
  Plus,
  ExternalLink,
  BarChart3,
  Calendar,
  Users,
  Sparkles
} from 'lucide-react';
import FormActions from '@/components/forms/FormActions';

async function getForms(userId: number, type?: string) {
  const where: any = { userId };

  if (type === 'form') {
    where.type = 'FORM';
  } else if (type === 'survey') {
    where.type = 'SURVEY';
  }

  return prisma.form.findMany({
    where,
    include: {
      _count: {
        select: { replies: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export default async function ManageFormsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = parseInt(session.user.id);
  const type = searchParams.type as string | undefined;
  const forms = await getForms(userId, type);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-gray-900">
                  My Forms
                </h1>
              </div>
              <p className="text-gray-600 text-lg">
                Manage and track all your forms in one place
              </p>
            </div>
            <Link href="/add-form">
              <Button variant="primary" size="lg" className="shadow-lg shadow-primary-500/30">
                <Plus className="h-5 w-5 mr-2" />
                Create New Form
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="inline-flex bg-white rounded-xl shadow-sm p-1 gap-1">
            <Link href="/manage-forms">
              <button
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  !type
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  All Forms ({forms.length})
                </span>
              </button>
            </Link>
            <Link href="/manage-forms?type=form">
              <button
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  type === 'form'
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Forms
                </span>
              </button>
            </Link>
            <Link href="/manage-forms?type=survey">
              <button
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  type === 'survey'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Surveys
                </span>
              </button>
            </Link>
          </div>
        </div>

        {/* Forms Table */}
        {forms.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Form Details
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Type
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Responses
                      </span>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Created
                      </span>
                    </th>
                    <th className="px-6 py-4 text-right">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {forms.map((form) => (
                    <tr
                      key={form.id}
                      className="hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent transition-all duration-200 group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${
                            form.type === 'SURVEY'
                              ? 'bg-primary-100'
                              : 'bg-primary-50'
                          }`}>
                            {form.type === 'SURVEY' ? (
                              <BarChart3 className={`h-5 w-5 ${
                                form.type === 'SURVEY'
                                  ? 'text-primary-700'
                                  : 'text-primary-600'
                              }`} />
                            ) : (
                              <FileText className="h-5 w-5 text-primary-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <Link
                              href={`/form-replies?id=${form.id}`}
                              className="block"
                            >
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                {form.title}
                              </p>
                              {form.description && (
                                <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                                  {form.description}
                                </p>
                              )}
                            </Link>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          form.type === 'SURVEY'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-primary-50 text-primary-600'
                        }`}>
                          {form.type}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                            form.status === 'ACTIVE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {form.status === 'ACTIVE' ? (
                            <>
                              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-primary-100 rounded-lg">
                            <Users className="h-4 w-4 text-primary-600" />
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {form._count.replies}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {new Date(form.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right relative">
                        <FormActions
                          formId={form.id}
                          formTitle={form.title}
                          status={form.status}
                          identifierhash={form.identifierhash}
                          appUrl={appUrl}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <Card className="border-2 border-dashed border-gray-300">
            <CardContent className="p-16 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {type
                    ? `No ${type}s yet`
                    : 'No forms yet'}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {type
                    ? `Create your first ${type} to start collecting data`
                    : 'Create your first form to start collecting data from your users'}
                </p>
                <Link href="/add-form">
                  <Button variant="primary" size="lg" className="shadow-lg shadow-primary-500/30">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Form
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
