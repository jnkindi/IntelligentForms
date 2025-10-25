import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Helper functions
function generateIdentifier(): string {
  return Math.random().toString(36).substring(2, 15) +
         Math.random().toString(36).substring(2, 15);
}

function generateHash(identifier: string): string {
  return crypto.createHash('md5').update(identifier).digest('hex');
}

async function main() {
  console.log('🌱 Starting database seed...\n');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@intelligentforms.com' },
    update: {},
    create: {
      names: 'Admin User',
      email: 'admin@intelligentforms.com',
      password: adminPassword,
      title: 'System Administrator',
      about: 'Admin account for managing IntelligentForms',
      twitter: 'https://twitter.com/intelligentforms',
      facebook: 'https://facebook.com/intelligentforms',
      linkedin: 'https://linkedin.com/company/intelligentforms',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create test user
  const testPassword = await bcrypt.hash('password123', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@intelligentforms.com' },
    update: {},
    create: {
      names: 'Test User',
      email: 'test@intelligentforms.com',
      password: testPassword,
      title: 'Product Manager',
      address: '123 Test Street, Kigali, Rwanda',
      about: 'Test user account for development and demos',
    },
  });
  console.log('✅ Created test user:', testUser.email);

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@intelligentforms.com' },
    update: {},
    create: {
      names: 'Demo User',
      email: 'demo@intelligentforms.com',
      password: demoPassword,
      title: 'Marketing Manager',
      about: 'Demo account showcasing IntelligentForms features',
    },
  });
  console.log('✅ Created demo user:', demoUser.email);

  console.log('\n📝 Creating sample forms...\n');

  // 1. Contact Form
  const contactFormId = generateIdentifier();
  const contactForm = await prisma.form.create({
    data: {
      title: 'Contact Us Form',
      type: 'FORM',
      identifier: contactFormId,
      identifierhash: generateHash(contactFormId),
      userId: admin.id,
      status: 'ACTIVE',
      description: 'Get in touch with our team. We\'d love to hear from you!',
      fields: {
        create: [
          {
            field: 'Full Name',
            answerType: 'TEXT',
            answerSubtype: 'text field',
            required: true,
            placeholder: 'John Doe',
            order: 1,
          },
          {
            field: 'Email Address',
            answerType: 'TEXT',
            answerSubtype: 'text field',
            required: true,
            placeholder: 'john@example.com',
            order: 2,
          },
          {
            field: 'Phone Number',
            answerType: 'TEXT',
            answerSubtype: 'phone',
            required: false,
            placeholder: '+250 788 123 456',
            order: 3,
          },
          {
            field: 'Subject',
            answerType: 'SINGLE_ANSWER',
            required: true,
            order: 4,
            expectedAnswers: {
              create: [
                { answer: 'General Inquiry', order: 1 },
                { answer: 'Technical Support', order: 2 },
                { answer: 'Sales', order: 3 },
                { answer: 'Partnership', order: 4 },
                { answer: 'Feedback', order: 5 },
              ],
            },
          },
          {
            field: 'Message',
            answerType: 'TEXT',
            answerSubtype: 'textbox',
            required: true,
            placeholder: 'Tell us more about your inquiry...',
            order: 5,
          },
        ],
      },
    },
    include: {
      fields: {
        orderBy: { order: 'asc' },
      },
    },
  });
  console.log('✅ Created Contact Form');

  // 2. Customer Satisfaction Survey
  const surveyId = generateIdentifier();
  const survey = await prisma.form.create({
    data: {
      title: 'Customer Satisfaction Survey',
      type: 'SURVEY',
      identifier: surveyId,
      identifierhash: generateHash(surveyId),
      userId: testUser.id,
      status: 'ACTIVE',
      description: 'Help us improve our service by sharing your feedback',
      fields: {
        create: [
          {
            field: 'How satisfied are you with our service?',
            answerType: 'SINGLE_ANSWER',
            required: true,
            order: 1,
            expectedAnswers: {
              create: [
                { answer: 'Very Satisfied', order: 1 },
                { answer: 'Satisfied', order: 2 },
                { answer: 'Neutral', order: 3 },
                { answer: 'Dissatisfied', order: 4 },
                { answer: 'Very Dissatisfied', order: 5 },
              ],
            },
          },
          {
            field: 'What features do you use most?',
            answerType: 'MULTIPLE_ANSWER',
            required: false,
            order: 2,
            expectedAnswers: {
              create: [
                { answer: 'Form Builder', order: 1 },
                { answer: 'Survey Creator', order: 2 },
                { answer: 'External API Integration', order: 3 },
                { answer: 'Form Embedding', order: 4 },
              ],
            },
          },
          {
            field: 'How likely are you to recommend us?',
            answerType: 'SINGLE_ANSWER',
            required: true,
            order: 3,
            expectedAnswers: {
              create: [
                { answer: '10 - Extremely Likely', order: 1 },
                { answer: '9', order: 2 },
                { answer: '8', order: 3 },
                { answer: '7', order: 4 },
                { answer: '6', order: 5 },
                { answer: '5 - Neutral', order: 6 },
                { answer: '4', order: 7 },
                { answer: '3', order: 8 },
                { answer: '2', order: 9 },
                { answer: '1', order: 10 },
                { answer: '0 - Not at all likely', order: 11 },
              ],
            },
          },
          {
            field: 'What can we improve?',
            answerType: 'TEXT',
            answerSubtype: 'textbox',
            required: false,
            placeholder: 'Share your suggestions...',
            order: 4,
          },
        ],
      },
    },
    include: {
      fields: {
        orderBy: { order: 'asc' },
      },
    },
  });
  console.log('✅ Created Customer Satisfaction Survey');

  // 3. Event Registration Form
  const eventFormId = generateIdentifier();
  const eventForm = await prisma.form.create({
    data: {
      title: 'Tech Conference 2024 Registration',
      type: 'FORM',
      identifier: eventFormId,
      identifierhash: generateHash(eventFormId),
      userId: demoUser.id,
      status: 'ACTIVE',
      description: 'Register for the biggest tech conference of the year!',
      fields: {
        create: [
          {
            field: 'Full Name',
            answerType: 'TEXT',
            answerSubtype: 'text field',
            required: true,
            placeholder: 'Jane Smith',
            order: 1,
          },
          {
            field: 'Email',
            answerType: 'TEXT',
            answerSubtype: 'text field',
            required: true,
            placeholder: 'jane@company.com',
            order: 2,
          },
          {
            field: 'Company/Organization',
            answerType: 'TEXT',
            answerSubtype: 'text field',
            required: false,
            placeholder: 'Acme Corp',
            order: 3,
          },
          {
            field: 'Job Title',
            answerType: 'TEXT',
            answerSubtype: 'text field',
            required: false,
            placeholder: 'Software Engineer',
            order: 4,
          },
          {
            field: 'Ticket Type',
            answerType: 'SINGLE_ANSWER',
            required: true,
            order: 5,
            expectedAnswers: {
              create: [
                { answer: 'Early Bird - $199', order: 1 },
                { answer: 'Standard - $299', order: 2 },
                { answer: 'VIP - $499', order: 3 },
                { answer: 'Student - $99', order: 4 },
              ],
            },
          },
          {
            field: 'Dietary Restrictions',
            answerType: 'MULTIPLE_ANSWER',
            required: false,
            order: 6,
            expectedAnswers: {
              create: [
                { answer: 'Vegetarian', order: 1 },
                { answer: 'Vegan', order: 2 },
                { answer: 'Gluten-Free', order: 3 },
                { answer: 'Halal', order: 4 },
                { answer: 'None', order: 5 },
              ],
            },
          },
          {
            field: 'Which sessions are you most interested in?',
            answerType: 'MULTIPLE_ANSWER',
            required: false,
            order: 7,
            expectedAnswers: {
              create: [
                { answer: 'AI & Machine Learning', order: 1 },
                { answer: 'Cloud Architecture', order: 2 },
                { answer: 'Cybersecurity', order: 3 },
                { answer: 'DevOps & CI/CD', order: 4 },
                { answer: 'Mobile Development', order: 5 },
                { answer: 'Web Development', order: 6 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('✅ Created Event Registration Form');

  // 4. Product Feedback Form
  const feedbackFormId = generateIdentifier();
  const feedbackForm = await prisma.form.create({
    data: {
      title: 'Product Feedback Form',
      type: 'FORM',
      identifier: feedbackFormId,
      identifierhash: generateHash(feedbackFormId),
      userId: testUser.id,
      status: 'ACTIVE',
      description: 'Share your thoughts about our product',
      fields: {
        create: [
          {
            field: 'Product Name',
            answerType: 'SINGLE_ANSWER',
            required: true,
            order: 1,
            expectedAnswers: {
              create: [
                { answer: 'IntelligentForms Pro', order: 1 },
                { answer: 'IntelligentForms Basic', order: 2 },
                { answer: 'IntelligentForms Enterprise', order: 3 },
              ],
            },
          },
          {
            field: 'Overall Rating',
            answerType: 'SINGLE_ANSWER',
            required: true,
            order: 2,
            expectedAnswers: {
              create: [
                { answer: '5 Stars - Excellent', order: 1 },
                { answer: '4 Stars - Good', order: 2 },
                { answer: '3 Stars - Average', order: 3 },
                { answer: '2 Stars - Poor', order: 4 },
                { answer: '1 Star - Very Poor', order: 5 },
              ],
            },
          },
          {
            field: 'What do you like most?',
            answerType: 'TEXT',
            answerSubtype: 'textbox',
            required: false,
            placeholder: 'Tell us what you love...',
            order: 3,
          },
          {
            field: 'What needs improvement?',
            answerType: 'TEXT',
            answerSubtype: 'textbox',
            required: false,
            placeholder: 'Help us get better...',
            order: 4,
          },
        ],
      },
    },
  });
  console.log('✅ Created Product Feedback Form');

  // 5. Newsletter Signup (Inactive form for demo)
  const newsletterId = generateIdentifier();
  const newsletter = await prisma.form.create({
    data: {
      title: 'Newsletter Subscription',
      type: 'FORM',
      identifier: newsletterId,
      identifierhash: generateHash(newsletterId),
      userId: admin.id,
      status: 'INACTIVE',
      description: 'Subscribe to our weekly newsletter',
      fields: {
        create: [
          {
            field: 'Email Address',
            answerType: 'TEXT',
            answerSubtype: 'text field',
            required: true,
            placeholder: 'your@email.com',
            order: 1,
          },
          {
            field: 'Interests',
            answerType: 'MULTIPLE_ANSWER',
            required: false,
            order: 2,
            expectedAnswers: {
              create: [
                { answer: 'Product Updates', order: 1 },
                { answer: 'Tech News', order: 2 },
                { answer: 'Tutorials', order: 3 },
                { answer: 'Special Offers', order: 4 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log('✅ Created Newsletter Subscription (Inactive)');

  // Create sample submissions for Contact Form
  console.log('\n📊 Creating sample submissions...\n');

  const submission1 = await prisma.formReplier.create({
    data: {
      formId: contactForm.id,
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      replies: {
        create: [
          {
            fieldId: contactForm.fields[0].id,
            answer: 'John Smith',
          },
          {
            fieldId: contactForm.fields[1].id,
            answer: 'john.smith@example.com',
          },
          {
            fieldId: contactForm.fields[2].id,
            answer: '+250 788 999 888',
          },
          {
            fieldId: contactForm.fields[3].id,
            answer: 'Technical Support',
          },
          {
            fieldId: contactForm.fields[4].id,
            answer: 'I need help setting up my account. Could someone guide me through the process?',
          },
        ],
      },
    },
  });

  const submission2 = await prisma.formReplier.create({
    data: {
      formId: contactForm.id,
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      date: new Date(Date.now() - 86400000), // 1 day ago
      replies: {
        create: [
          {
            fieldId: contactForm.fields[0].id,
            answer: 'Sarah Johnson',
          },
          {
            fieldId: contactForm.fields[1].id,
            answer: 'sarah.j@company.com',
          },
          {
            fieldId: contactForm.fields[3].id,
            answer: 'Sales',
          },
          {
            fieldId: contactForm.fields[4].id,
            answer: 'Interested in the enterprise plan. Can you provide pricing details?',
          },
        ],
      },
    },
  });

  console.log('✅ Created 2 sample submissions for Contact Form');

  // Create sample submission for Survey
  await prisma.formReplier.create({
    data: {
      formId: survey.id,
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)',
      replies: {
        create: [
          {
            fieldId: survey.fields[0].id,
            answer: 'Satisfied',
          },
          {
            fieldId: survey.fields[1].id,
            answer: 'Form Builder, External API Integration',
          },
          {
            fieldId: survey.fields[2].id,
            answer: '9',
          },
          {
            fieldId: survey.fields[3].id,
            answer: 'More templates would be helpful!',
          },
        ],
      },
    },
  });

  console.log('✅ Created 1 sample submission for Survey');

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('✅ DATABASE SEED COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log('\n📋 Summary:');
  console.log(`   👥 Users Created: 3`);
  console.log(`   📝 Forms Created: 6`);
  console.log(`   📊 Submissions Created: 3`);
  console.log('\n🔑 Login Credentials:');
  console.log('   Admin:  admin@intelligentforms.com  / admin123');
  console.log('   Test:   test@intelligentforms.com   / password123');
  console.log('   Demo:   demo@intelligentforms.com   / demo123');
  console.log('\n🌐 Access: http://localhost:3000');
  console.log('='.repeat(60) + '\n');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
