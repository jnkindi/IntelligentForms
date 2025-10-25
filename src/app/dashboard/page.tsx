import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/database';
import { Card, CardContent } from '@/components/ui/Card';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import {
  FileText,
  BarChart3,
  Plus,
  Users,
  TrendingUp,
  Activity,
  Sparkles,
  ArrowRight,
  Calendar,
  Eye
} from 'lucide-react';

async function getStatistics(userId: number) {
  const [totalForms, activeForms, allForms, recentForms] = await Promise.all([
    prisma.form.count({ where: { userId } }),
    prisma.form.count({ where: { userId, status: 'ACTIVE' } }),
    prisma.form.findMany({
      where: { userId },
      include: {
        _count: {
          select: { replies: true },
        },
      },
    }),
    prisma.form.findMany({
      where: { userId },
      include: {
        _count: {
          select: { replies: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const totalSurveys = allForms.filter((f) => f.type === 'SURVEY').length;
  const totalRegularForms = allForms.filter((f) => f.type === 'FORM').length;

  const totalSubmissions = allForms.reduce(
    (sum, form) => sum + form._count.replies,
    0
  );

  // Get submissions from last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const recentSubmissionsCount = await prisma.formReplier.count({
    where: {
      form: {
        userId,
      },
      date: {
        gte: sevenDaysAgo,
      },
    },
  });

  return {
    totalForms,
    activeForms,
    inactiveForms: totalForms - activeForms,
    totalSurveys,
    totalRegularForms,
    totalSubmissions,
    recentSubmissionsCount,
    recentForms,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = parseInt(session.user.id);
  const stats = await getStatistics(userId);

  const statCards = [
    {
      title: 'Total Forms',
      value: stats.totalForms,
      subtitle: `${stats.activeForms} active`,
      icon: FileText,
      gradient: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
      iconColor: 'text-primary-600',
    },
    {
      title: 'Total Submissions',
      value: stats.totalSubmissions,
      subtitle: `${stats.recentSubmissionsCount} this week`,
      icon: Users,
      gradient: 'from-primary-400 to-primary-500',
      bgColor: 'bg-primary-100',
      iconColor: 'text-primary-600',
    },
    {
      title: 'Regular Forms',
      value: stats.totalRegularForms,
      subtitle: 'Contact & data forms',
      icon: FileText,
      gradient: 'from-primary-600 to-primary-700',
      bgColor: 'bg-primary-100',
      iconColor: 'text-primary-700',
    },
    {
      title: 'Surveys',
      value: stats.totalSurveys,
      subtitle: 'Feedback & insights',
      icon: BarChart3,
      gradient: 'from-primary-700 to-primary-800',
      bgColor: 'bg-primary-100',
      iconColor: 'text-primary-700',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome back, {session.user.name}!
              </h1>
            </div>
          </div>
          <p className="text-gray-600 text-lg ml-14">
            Here's what's happening with your forms today
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="relative overflow-hidden hover:shadow-xl transition-all duration-300 group border-0 shadow-lg"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 mb-2">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {stat.value}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {stat.subtitle}
                      </p>
                    </div>
                    <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                      <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary-600" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/add-form?type=form" className="group">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary-200 bg-gradient-to-br from-white to-primary-50">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform shadow-lg">
                    <FileText className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Create Form
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Build a new contact form or data collection form
                  </p>
                  <div className="flex items-center justify-center text-primary-600 font-semibold group-hover:gap-3 transition-all">
                    Get Started <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/add-form?type=survey" className="group">
              <Card className="h-full hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 bg-gradient-to-br from-white to-blue-50">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform shadow-lg">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Create Survey
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Design a survey to gather feedback and insights
                  </p>
                  <div className="flex items-center justify-center text-blue-600 font-semibold group-hover:gap-3 transition-all">
                    Get Started <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Forms */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary-600" />
              Recent Forms
            </h2>
            <Link href="/manage-forms">
              <Button variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
                View All Forms
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {stats.recentForms.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="divide-y divide-gray-100">
                {stats.recentForms.map((form) => (
                  <div
                    key={form.id}
                    className="p-6 hover:bg-gradient-to-r hover:from-primary-50 hover:to-transparent transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`p-3 rounded-xl ${
                          form.type === 'SURVEY' ? 'bg-primary-100' : 'bg-primary-50'
                        } group-hover:scale-110 transition-transform`}>
                          {form.type === 'SURVEY' ? (
                            <BarChart3 className="h-6 w-6 text-primary-700" />
                          ) : (
                            <FileText className="h-6 w-6 text-primary-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                              {form.title}
                            </h3>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                                form.status === 'ACTIVE'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {form.status === 'ACTIVE' && (
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                              )}
                              {form.status}
                            </span>
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full whitespace-nowrap ${
                              form.type === 'SURVEY'
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-primary-50 text-primary-600'
                            }`}>
                              {form.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {form._count.replies} submission{form._count.replies !== 1 ? 's' : ''}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(form.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/form-replies?id=${form.id}`}>
                        <Button variant="outline" size="sm" className="whitespace-nowrap shadow-sm hover:shadow-md transition-shadow">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
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
                    No forms yet
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg">
                    Create your first form to start collecting valuable data from your users
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
    </div>
  );
}
