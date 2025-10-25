import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { TrendingUp, Clock, CheckCircle, BarChart3 } from 'lucide-react';

interface FormField {
  id: number;
  field: string;
  required: boolean;
}

interface Reply {
  id: number;
  answer: string;
  fieldId: number;
}

interface FormReplier {
  id: number;
  date: Date;
  replies: Reply[];
}

interface FormData {
  id: number;
  title: string;
  fields: FormField[];
  replies: FormReplier[];
}

interface SubmissionAnalyticsProps {
  form: FormData;
}

export default function SubmissionAnalytics({ form }: SubmissionAnalyticsProps) {
  // Calculate analytics
  const totalSubmissions = form.replies.length;
  const requiredFields = form.fields.filter((f) => f.required).length;

  // Calculate completion rate (percentage of required fields filled)
  const completionRates = form.replies.map((replier) => {
    const answeredRequired = form.fields
      .filter((f) => f.required)
      .filter((f) => replier.replies.some((r) => r.fieldId === f.id && r.answer))
      .length;
    return requiredFields > 0 ? (answeredRequired / requiredFields) * 100 : 100;
  });
  const avgCompletionRate = completionRates.length > 0
    ? completionRates.reduce((a, b) => a + b, 0) / completionRates.length
    : 0;

  // Get submissions in last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentSubmissions = form.replies.filter(
    (r) => new Date(r.date) >= sevenDaysAgo
  ).length;

  // Get most recent submission date
  const mostRecentDate = form.replies.length > 0
    ? new Date(form.replies[0].date)
    : null;

  // Calculate average responses per field
  const fieldResponseCounts = form.fields.map((field) => {
    const responses = form.replies.filter((replier) =>
      replier.replies.some((r) => r.fieldId === field.id && r.answer)
    ).length;
    return responses;
  });
  const avgResponsesPerField =
    fieldResponseCounts.length > 0
      ? fieldResponseCounts.reduce((a, b) => a + b, 0) / fieldResponseCounts.length
      : 0;
  const responseRate = totalSubmissions > 0
    ? (avgResponsesPerField / totalSubmissions) * 100
    : 0;

  // Submissions by day (last 7 days)
  const submissionsByDay: { [key: string]: number } = {};
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateKey = date.toISOString().split('T')[0];
    submissionsByDay[dateKey] = 0;
  }

  form.replies.forEach((replier) => {
    const dateKey = new Date(replier.date).toISOString().split('T')[0];
    if (submissionsByDay.hasOwnProperty(dateKey)) {
      submissionsByDay[dateKey]++;
    }
  });

  const maxSubmissionsInDay = Math.max(...Object.values(submissionsByDay), 1);

  return (
    <div className="mb-8 space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Submissions</p>
                <p className="text-3xl font-bold text-gray-900">
                  {totalSubmissions}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  All time responses
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Last 7 Days</p>
                <p className="text-3xl font-bold text-gray-900">
                  {recentSubmissions}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalSubmissions > 0
                    ? `${((recentSubmissions / totalSubmissions) * 100).toFixed(0)}% of total`
                    : 'No submissions yet'}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {avgCompletionRate.toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Required fields filled
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Response Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {responseRate.toFixed(0)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Avg. fields answered
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Submissions Over Time (Last 7 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(submissionsByDay).map(([date, count]) => {
              const percentage = (count / maxSubmissionsInDay) * 100;
              const displayDate = new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div key={date} className="flex items-center gap-3">
                  <div className="w-16 text-sm text-gray-600">{displayDate}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                    <div
                      className="bg-primary-600 h-full rounded-full flex items-center justify-end pr-2"
                      style={{ width: `${Math.max(percentage, count > 0 ? 10 : 0)}%` }}
                    >
                      {count > 0 && (
                        <span className="text-xs font-medium text-white">{count}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Field Response Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Field Response Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {form.fields.map((field) => {
              const responses = form.replies.filter((replier) =>
                replier.replies.some((r) => r.fieldId === field.id && r.answer)
              ).length;
              const percentage = totalSubmissions > 0
                ? (responses / totalSubmissions) * 100
                : 0;

              return (
                <div key={field.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {field.field}
                      {field.required && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </span>
                    <span className="text-sm text-gray-600">
                      {responses}/{totalSubmissions} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-full rounded-full ${
                        percentage >= 90
                          ? 'bg-green-600'
                          : percentage >= 70
                          ? 'bg-yellow-600'
                          : 'bg-red-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
