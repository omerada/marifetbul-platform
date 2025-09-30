import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Analytics query validation schema
const AnalyticsQuerySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  userType: z.enum(['freelancer', 'employer']),
  period: z.enum(['week', 'month', 'quarter', 'year']).default('month'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  metrics: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Mock authentication - In production, implement proper auth validation
    const mockSession = {
      user: {
        id: 'current-user-id',
        name: 'Current User',
        userType: 'freelancer',
      },
    };

    const searchParams = request.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());

    // Process query parameters
    const processedParams = {
      ...queryParams,
      userId: queryParams.userId || mockSession.user.id,
      userType: queryParams.userType || mockSession.user.userType,
      metrics: queryParams.metrics ? queryParams.metrics.split(',') : undefined,
    };

    const validatedQuery = AnalyticsQuerySchema.parse(processedParams);

    // Generate mock analytics data based on user type
    const analyticsData =
      validatedQuery.userType === 'freelancer'
        ? generateFreelancerAnalytics(validatedQuery)
        : generateEmployerAnalytics(validatedQuery);

    return NextResponse.json({
      success: true,
      data: analyticsData,
      period: validatedQuery.period,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateFreelancerAnalytics(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _query: z.infer<typeof AnalyticsQuerySchema>
) {
  return {
    overview: {
      totalProjects: 45,
      completedProjects: 42,
      activeProjects: 3,
      totalEarnings: 125750,
      averageRating: 4.8,
      responseTime: '2h 15m',
      completionRate: 93.3,
      repeatClientRate: 67.5,
    },
    performance: {
      projectSuccess: [
        { month: 'Jan', completed: 8, cancelled: 0 },
        { month: 'Feb', completed: 6, cancelled: 1 },
        { month: 'Mar', completed: 9, cancelled: 0 },
        { month: 'Apr', completed: 7, cancelled: 0 },
        { month: 'May', completed: 8, cancelled: 1 },
        { month: 'Jun', completed: 4, cancelled: 1 },
      ],
      earnings: [
        { month: 'Jan', amount: 18500 },
        { month: 'Feb', amount: 15200 },
        { month: 'Mar', amount: 22800 },
        { month: 'Apr', amount: 19600 },
        { month: 'May', amount: 21300 },
        { month: 'Jun', amount: 28350 },
      ],
      ratingTrend: [
        { month: 'Jan', rating: 4.6 },
        { month: 'Feb', rating: 4.7 },
        { month: 'Mar', rating: 4.8 },
        { month: 'Apr', rating: 4.9 },
        { month: 'May', rating: 4.8 },
        { month: 'Jun', rating: 4.8 },
      ],
    },
    clientAnalytics: {
      topClients: [
        { id: '1', name: 'TechCorp Inc.', projects: 8, earnings: 35200 },
        { id: '2', name: 'StartupXYZ', projects: 5, earnings: 22500 },
        { id: '3', name: 'Digital Agency', projects: 4, earnings: 18800 },
      ],
      clientRetention: 67.5,
      newVsRepeat: { new: 32.5, repeat: 67.5 },
    },
    skillsAnalytics: {
      topSkills: [
        { skill: 'React.js', projects: 18, averageRate: 85 },
        { skill: 'Node.js', projects: 15, averageRate: 80 },
        { skill: 'TypeScript', projects: 12, averageRate: 90 },
        { skill: 'UI/UX Design', projects: 8, averageRate: 75 },
      ],
      inDemandSkills: ['Next.js', 'Python', 'AWS', 'GraphQL'],
    },
    timeAnalytics: {
      averageProjectDuration: 12, // days
      mostProductiveHours: [9, 10, 11, 14, 15, 16],
      timeTracking: {
        totalHours: 1240,
        billableHours: 1180,
        billableRate: 95.2,
      },
    },
    marketInsights: {
      competitorAnalysis: {
        yourPosition: 'Top 15%',
        averageRateComparison: '+12%',
        skillDemandGrowth: '+23%',
      },
      recommendations: [
        'Consider raising rates for React.js projects',
        'Expand into Next.js to meet growing demand',
        'Focus on client retention strategies',
      ],
    },
  };
}

function generateEmployerAnalytics(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _query: z.infer<typeof AnalyticsQuerySchema>
) {
  return {
    overview: {
      totalProjects: 28,
      activeProjects: 5,
      completedProjects: 23,
      totalSpent: 89450,
      averageProjectCost: 3195,
      successRate: 89.3,
      averageTimeToHire: '3.2 days',
      freelancerRetention: 71.4,
    },
    projectAnalytics: {
      projectsByCategory: [
        { category: 'Web Development', count: 12, avgCost: 4200 },
        { category: 'Mobile Development', count: 8, avgCost: 5800 },
        { category: 'Design', count: 5, avgCost: 1800 },
        { category: 'Marketing', count: 3, avgCost: 2100 },
      ],
      completionTrend: [
        { month: 'Jan', completed: 4, started: 5 },
        { month: 'Feb', completed: 3, started: 3 },
        { month: 'Mar', completed: 5, started: 6 },
        { month: 'Apr', completed: 4, started: 4 },
        { month: 'May', completed: 3, started: 4 },
        { month: 'Jun', completed: 4, started: 6 },
      ],
      budgetUtilization: [
        { month: 'Jan', budget: 15000, spent: 14200 },
        { month: 'Feb', budget: 12000, spent: 10800 },
        { month: 'Mar', budget: 18000, spent: 17500 },
        { month: 'Apr', budget: 14000, spent: 13600 },
        { month: 'May', budget: 16000, spent: 14900 },
        { month: 'Jun', budget: 20000, spent: 18450 },
      ],
    },
    freelancerAnalytics: {
      topFreelancers: [
        {
          id: '1',
          name: 'Alice Johnson',
          projects: 6,
          avgRating: 4.9,
          totalCost: 28500,
        },
        {
          id: '2',
          name: 'Bob Smith',
          projects: 4,
          avgRating: 4.8,
          totalCost: 19200,
        },
        {
          id: '3',
          name: 'Carol Davis',
          projects: 3,
          avgRating: 4.7,
          totalCost: 15800,
        },
      ],
      hiringPatterns: {
        averageApplications: 12,
        averageTimeToDecision: '2.8 days',
        hireRate: 8.3, // percentage
      },
      retentionMetrics: {
        oneTimeHires: 28.6,
        repeatHires: 71.4,
        longTermCollaborations: 42.9, // 3+ projects
      },
    },
    costAnalytics: {
      costBreakdown: {
        freelancerPayments: 89450,
        platformFees: 4473, // 5% platform fee
        totalSpent: 93923,
      },
      savingsAnalysis: {
        vsInHouse: 45600, // estimated savings
        costPerHour: 68,
        efficiency: '+34%',
      },
      budgetForecast: {
        nextMonth: 22000,
        nextQuarter: 65000,
        confidence: 'High',
      },
    },
    qualityMetrics: {
      averageProjectRating: 4.6,
      reworkRate: 12.5, // percentage
      onTimeDelivery: 85.7,
      communicationRating: 4.4,
    },
    marketInsights: {
      talentPoolAnalysis: {
        availableFreelancers: 1250,
        skillGaps: ['AI/ML', 'Blockchain', 'Mobile AR'],
        competitionLevel: 'Medium',
      },
      recommendations: [
        'Consider long-term contracts for top performers',
        'Invest in AI/ML projects while talent is available',
        'Create standardized onboarding process',
      ],
    },
  };
}
