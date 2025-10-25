import { Card, CardContent } from '@/components/ui/Card';
import { Target, Users, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Intelligent Forms
          </h1>
          <p className="text-xl text-primary-100">
            Open-source form management for organizations that value data privacy and sovereignty
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <Target className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Our Mission
                </h3>
                <p className="text-gray-600">
                  To provide organizations with a privacy-first, self-hosted form management system
                  that ensures complete data sovereignty and control.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <Users className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Open Source
                </h3>
                <p className="text-gray-600">
                  Built by the community, for the community. Free to use, modify, and distribute
                  under the MIT license with complete transparency.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="p-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-full mb-4">
                  <Zap className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Our Vision
                </h3>
                <p className="text-gray-600">
                  To be the leading open-source solution for organizations that prioritize
                  data privacy, security, and complete control over their information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Our Story
          </h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="mb-4">
              Intelligent Forms was created to address a critical need: organizations require
              powerful form management tools, but they shouldn't have to sacrifice data privacy
              and control to get them. We believe that your data belongs to you, not in someone
              else's cloud.
            </p>
            <p className="mb-4">
              As an open-source, self-hosted solution, Intelligent Forms gives organizations
              complete sovereignty over their data. Deploy it on your own infrastructure,
              customize it to your needs, and rest easy knowing that your sensitive information
              never leaves your control.
            </p>
            <p>
              Built with modern technologies and enterprise-grade security, Intelligent Forms
              serves organizations across education, healthcare, government, and any sector where
              data privacy is paramount. We're committed to transparency, security, and continuous
              improvement through our open-source community.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Our Values
          </h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Privacy First
              </h3>
              <p className="text-gray-600">
                Data sovereignty is not optional. We built Intelligent Forms to be self-hosted,
                ensuring your sensitive information never leaves your infrastructure.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Open Source
              </h3>
              <p className="text-gray-600">
                Complete transparency and freedom. Inspect our code, contribute improvements,
                and customize the platform to your exact needs. MIT licensed for maximum flexibility.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Security
              </h3>
              <p className="text-gray-600">
                Enterprise-grade security with bcrypt password hashing, JWT authentication,
                role-based access control, and SQL injection prevention built-in.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Community Driven
              </h3>
              <p className="text-gray-600">
                Built by the community, for the community. We welcome contributions and value
                feedback to continuously improve the platform for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
