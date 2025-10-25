import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { FileText, BarChart3, Zap, Shield, Code } from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      icon: <Shield className="h-8 w-8 text-primary-600" />,
      title: 'Privacy-First & Self-Hosted',
      description:
        'Complete data sovereignty with open-source, self-hosted solution. Your data stays with you.',
    },
    {
      icon: <FileText className="h-8 w-8 text-primary-600" />,
      title: 'Dynamic Forms & Surveys',
      description:
        'Create custom forms with multiple field types, validation, and conditional logic.',
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary-600" />,
      title: 'Real-Time Analytics',
      description:
        'Comprehensive statistics and submission tracking with powerful export capabilities.',
    },
    {
      icon: <Zap className="h-8 w-8 text-primary-600" />,
      title: 'Offline Functionality',
      description: 'IndexedDB-powered offline submissions with automatic sync when online.',
    },
    {
      icon: <Code className="h-8 w-8 text-primary-600" />,
      title: 'Role-Based Access Control',
      description: 'Multi-user support with Admin, Manager, and User roles for team collaboration.',
    },
  ];

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6">
              Open-Source Form Builder
              <br />
              for Data Privacy
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Self-hosted, privacy-first form management for organizations that value data
              sovereignty. Build dynamic forms, collect submissions offline, and maintain complete
              control.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/setup">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Get Started - Self-Host
                </Button>
              </Link>
              <Link href="/about">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white text-primary-600 hover:bg-primary-50 border-white"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features to create, manage, and analyze your forms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Self-Host in Minutes
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Deploy your own private form management system in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Deploy & Setup</h3>
              <p className="text-gray-600">
                Install on your server with PostgreSQL. Complete the initial organization setup
                wizard
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Manage Users & Roles</h3>
              <p className="text-gray-600">
                Create team members with role-based permissions and assign form access
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Build & Collect</h3>
              <p className="text-gray-600">
                Create dynamic forms, collect submissions offline, and export your data
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Take Control of Your Data</h2>
          <p className="text-xl mb-8 text-primary-100">
            Join organizations worldwide using Intelligent Forms for privacy-first data collection
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/setup">
              <Button size="lg" variant="secondary">
                Start Self-Hosting
              </Button>
            </Link>
            <a
              href="https://github.com/jnkindi/intelligent-forms"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-primary-600 hover:bg-primary-50 border-white"
              >
                View on GitHub
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
