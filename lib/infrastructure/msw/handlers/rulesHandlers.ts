import { http, HttpResponse } from 'msw';

// Types
interface ModerationRule {
  id: string;
  name: string;
  description: string;
  category:
    | 'user_behavior'
    | 'content_quality'
    | 'spam_detection'
    | 'community_guidelines'
    | 'safety'
    | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  triggers: number;
  effectiveness: number;
}

interface RuleCondition {
  id: string;
  type:
    | 'keyword'
    | 'pattern'
    | 'user_behavior'
    | 'content_type'
    | 'time_based'
    | 'metadata';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex';
  value: string;
  parameters?: Record<string, string | number | boolean>;
}

interface RuleAction {
  id: string;
  type:
    | 'flag'
    | 'hide'
    | 'remove'
    | 'escalate'
    | 'auto_approve'
    | 'require_review'
    | 'notify'
    | 'block_user'
    | 'restrict_user';
  target: 'content' | 'user' | 'moderator';
  parameters?: Record<string, string | number | boolean>;
}

interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  conditions: Omit<RuleCondition, 'id'>[];
  actions: Omit<RuleAction, 'id'>[];
  tags: string[];
}

interface RuleAnalytics {
  totalRules: number;
  activeRules: number;
  totalTriggers: number;
  avgEffectiveness: number;
  topCategories: Array<{
    category: string;
    count: number;
    effectiveness: number;
  }>;
  recentActivity: Array<{
    id: string;
    ruleId: string;
    ruleName: string;
    action: string;
    timestamp: string;
    target: string;
  }>;
  performanceMetrics: Array<{
    ruleId: string;
    ruleName: string;
    triggers: number;
    effectiveness: number;
    falsePositives: number;
    successRate: number;
  }>;
}

// Mock Data
const mockRules: ModerationRule[] = [
  {
    id: 'rule-1',
    name: 'Spam İçerik Tespiti',
    description:
      'Spam içerik ve tekrarlayan mesajları otomatik olarak tespit eder',
    category: 'spam_detection',
    severity: 'high',
    isActive: true,
    conditions: [
      {
        id: 'cond-1',
        type: 'keyword',
        operator: 'contains',
        value: 'spam, reklam, satış',
        parameters: { caseSensitive: false },
      },
      {
        id: 'cond-2',
        type: 'user_behavior',
        operator: 'greater_than',
        value: '5',
        parameters: { timeWindow: '1hour', action: 'post' },
      },
    ],
    actions: [
      {
        id: 'action-1',
        type: 'flag',
        target: 'content',
        parameters: { severity: 'high' },
      },
      {
        id: 'action-2',
        type: 'notify',
        target: 'moderator',
        parameters: { priority: 'high' },
      },
    ],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
    createdBy: 'admin',
    triggers: 145,
    effectiveness: 92.5,
  },
  {
    id: 'rule-2',
    name: 'Küfür ve Hakaret Engelleme',
    description:
      'Uygunsuz dil kullanımını tespit eder ve otomatik aksiyon alır',
    category: 'community_guidelines',
    severity: 'critical',
    isActive: true,
    conditions: [
      {
        id: 'cond-3',
        type: 'pattern',
        operator: 'regex',
        value: '\\b(küfür|hakaret|saldırgan)\\b',
        parameters: { flags: 'gi' },
      },
    ],
    actions: [
      {
        id: 'action-3',
        type: 'remove',
        target: 'content',
        parameters: { immediate: true },
      },
      {
        id: 'action-4',
        type: 'restrict_user',
        target: 'user',
        parameters: { duration: '24hours', type: 'warning' },
      },
    ],
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-01-18T16:45:00Z',
    createdBy: 'admin',
    triggers: 78,
    effectiveness: 87.3,
  },
  {
    id: 'rule-3',
    name: 'Kalite Kontrolü',
    description: 'Düşük kaliteli içerikleri incelemelere yönlendirir',
    category: 'content_quality',
    severity: 'medium',
    isActive: true,
    conditions: [
      {
        id: 'cond-4',
        type: 'content_type',
        operator: 'less_than',
        value: '10',
        parameters: { measure: 'wordCount' },
      },
      {
        id: 'cond-5',
        type: 'metadata',
        operator: 'equals',
        value: 'low',
        parameters: { field: 'qualityScore' },
      },
    ],
    actions: [
      {
        id: 'action-5',
        type: 'require_review',
        target: 'content',
        parameters: { priority: 'medium' },
      },
    ],
    createdAt: '2024-01-12T10:15:00Z',
    updatedAt: '2024-01-19T12:20:00Z',
    createdBy: 'moderator1',
    triggers: 234,
    effectiveness: 76.8,
  },
];

const mockTemplates: RuleTemplate[] = [
  {
    id: 'template-1',
    name: 'Spam Mesaj Şablonu',
    description: 'Temel spam tespit kuralları',
    category: 'spam_detection',
    conditions: [
      {
        type: 'keyword',
        operator: 'contains',
        value: 'bedava, ücretsiz, kazanç',
        parameters: { caseSensitive: false },
      },
    ],
    actions: [
      {
        type: 'flag',
        target: 'content',
        parameters: { severity: 'medium' },
      },
    ],
    tags: ['spam', 'keyword', 'basic'],
  },
  {
    id: 'template-2',
    name: 'Toxik Davranış Şablonu',
    description: 'Toksik kullanıcı davranışlarını tespit eder',
    category: 'user_behavior',
    conditions: [
      {
        type: 'user_behavior',
        operator: 'greater_than',
        value: '3',
        parameters: { timeWindow: '1hour', action: 'negative_report' },
      },
    ],
    actions: [
      {
        type: 'restrict_user',
        target: 'user',
        parameters: { duration: '12hours' },
      },
    ],
    tags: ['behavior', 'toxic', 'user'],
  },
  {
    id: 'template-3',
    name: 'İçerik Kalite Şablonu',
    description: 'Düşük kaliteli içerik tespiti',
    category: 'content_quality',
    conditions: [
      {
        type: 'content_type',
        operator: 'less_than',
        value: '20',
        parameters: { measure: 'charCount' },
      },
    ],
    actions: [
      {
        type: 'require_review',
        target: 'content',
        parameters: { priority: 'low' },
      },
    ],
    tags: ['quality', 'content', 'review'],
  },
];

const mockAnalytics: RuleAnalytics = {
  totalRules: 12,
  activeRules: 8,
  totalTriggers: 1247,
  avgEffectiveness: 85.2,
  topCategories: [
    { category: 'spam_detection', count: 4, effectiveness: 89.3 },
    { category: 'community_guidelines', count: 3, effectiveness: 92.1 },
    { category: 'content_quality', count: 3, effectiveness: 78.5 },
    { category: 'user_behavior', count: 2, effectiveness: 84.7 },
  ],
  recentActivity: [
    {
      id: 'activity-1',
      ruleId: 'rule-1',
      ruleName: 'Spam İçerik Tespiti',
      action: 'content_flagged',
      timestamp: '2024-01-20T15:30:00Z',
      target: 'İş ilanı #12345',
    },
    {
      id: 'activity-2',
      ruleId: 'rule-2',
      ruleName: 'Küfür ve Hakaret Engelleme',
      action: 'content_removed',
      timestamp: '2024-01-20T15:25:00Z',
      target: 'Yorum #67890',
    },
    {
      id: 'activity-3',
      ruleId: 'rule-3',
      ruleName: 'Kalite Kontrolü',
      action: 'review_required',
      timestamp: '2024-01-20T15:20:00Z',
      target: 'Paket #54321',
    },
    {
      id: 'activity-4',
      ruleId: 'rule-1',
      ruleName: 'Spam İçerik Tespiti',
      action: 'user_warned',
      timestamp: '2024-01-20T15:15:00Z',
      target: 'Kullanıcı @spammer123',
    },
    {
      id: 'activity-5',
      ruleId: 'rule-2',
      ruleName: 'Küfür ve Hakaret Engelleme',
      action: 'user_restricted',
      timestamp: '2024-01-20T15:10:00Z',
      target: 'Kullanıcı @toxic_user',
    },
  ],
  performanceMetrics: [
    {
      ruleId: 'rule-1',
      ruleName: 'Spam İçerik Tespiti',
      triggers: 145,
      effectiveness: 92.5,
      falsePositives: 11,
      successRate: 92.4,
    },
    {
      ruleId: 'rule-2',
      ruleName: 'Küfür ve Hakaret Engelleme',
      triggers: 78,
      effectiveness: 87.3,
      falsePositives: 10,
      successRate: 87.2,
    },
    {
      ruleId: 'rule-3',
      ruleName: 'Kalite Kontrolü',
      triggers: 234,
      effectiveness: 76.8,
      falsePositives: 54,
      successRate: 76.9,
    },
  ],
};

// Utility functions
const generateId = () =>
  `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const rulesHandlers = [
  // Get all rules
  http.get('/api/moderation/rules', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let filteredRules = [...mockRules];

    // Apply filters
    if (category && category !== 'all') {
      filteredRules = filteredRules.filter(
        (rule) => rule.category === category
      );
    }

    if (status && status !== 'all') {
      filteredRules = filteredRules.filter((rule) =>
        status === 'active' ? rule.isActive : !rule.isActive
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredRules = filteredRules.filter(
        (rule) =>
          rule.name.toLowerCase().includes(searchLower) ||
          rule.description.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRules = filteredRules.slice(startIndex, endIndex);

    return HttpResponse.json({
      rules: paginatedRules,
      pagination: {
        current: page,
        total: Math.ceil(filteredRules.length / limit),
        count: filteredRules.length,
        limit,
      },
    });
  }),

  // Get rule by ID
  http.get('/api/moderation/rules/:id', ({ params }) => {
    const rule = mockRules.find((r) => r.id === params.id);

    if (!rule) {
      return HttpResponse.json({ error: 'Kural bulunamadı' }, { status: 404 });
    }

    return HttpResponse.json({ rule });
  }),

  // Create new rule
  http.post('/api/moderation/rules', async ({ request }) => {
    const body = (await request.json()) as Partial<ModerationRule>;

    const newRule: ModerationRule = {
      id: generateId(),
      name: body.name || 'Yeni Kural',
      description: body.description || '',
      category: body.category || 'custom',
      severity: body.severity || 'medium',
      isActive: body.isActive ?? true,
      conditions: body.conditions || [],
      actions: body.actions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current_user',
      triggers: 0,
      effectiveness: 0,
    };

    mockRules.unshift(newRule);

    return HttpResponse.json(
      {
        message: 'Kural başarıyla oluşturuldu',
        rule: newRule,
      },
      { status: 201 }
    );
  }),

  // Update rule
  http.put('/api/moderation/rules/:id', async ({ params, request }) => {
    const ruleIndex = mockRules.findIndex((r) => r.id === params.id);

    if (ruleIndex === -1) {
      return HttpResponse.json({ error: 'Kural bulunamadı' }, { status: 404 });
    }

    const updates = (await request.json()) as Partial<ModerationRule>;
    const updatedRule = {
      ...mockRules[ruleIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    mockRules[ruleIndex] = updatedRule;

    return HttpResponse.json({
      message: 'Kural başarıyla güncellendi',
      rule: updatedRule,
    });
  }),

  // Delete rule
  http.delete('/api/moderation/rules/:id', ({ params }) => {
    const ruleIndex = mockRules.findIndex((r) => r.id === params.id);

    if (ruleIndex === -1) {
      return HttpResponse.json({ error: 'Kural bulunamadı' }, { status: 404 });
    }

    mockRules.splice(ruleIndex, 1);

    return HttpResponse.json({
      message: 'Kural başarıyla silindi',
    });
  }),

  // Toggle rule status
  http.patch('/api/moderation/rules/:id/toggle', ({ params }) => {
    const rule = mockRules.find((r) => r.id === params.id);

    if (!rule) {
      return HttpResponse.json({ error: 'Kural bulunamadı' }, { status: 404 });
    }

    rule.isActive = !rule.isActive;
    rule.updatedAt = new Date().toISOString();

    return HttpResponse.json({
      message: `Kural ${rule.isActive ? 'aktif' : 'pasif'} hale getirildi`,
      rule,
    });
  }),

  // Test rule
  http.post('/api/moderation/rules/:id/test', async ({ params, request }) => {
    const rule = mockRules.find((r) => r.id === params.id);

    if (!rule) {
      return HttpResponse.json({ error: 'Kural bulunamadı' }, { status: 404 });
    }

    const { testData } = (await request.json()) as {
      testData: Record<string, unknown>;
    };

    // Simulate rule testing
    const testResult = {
      ruleId: rule.id,
      ruleName: rule.name,
      matched: Math.random() > 0.3, // Random match result
      matchedConditions: rule.conditions.slice(
        0,
        Math.ceil(Math.random() * rule.conditions.length)
      ),
      triggeredActions: Math.random() > 0.3 ? rule.actions : [],
      executionTime: Math.floor(Math.random() * 50) + 10, // 10-60ms
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100%
      testData,
    };

    return HttpResponse.json({
      message: 'Kural test edildi',
      result: testResult,
    });
  }),

  // Duplicate rule
  http.post('/api/moderation/rules/:id/duplicate', ({ params }) => {
    const originalRule = mockRules.find((r) => r.id === params.id);

    if (!originalRule) {
      return HttpResponse.json({ error: 'Kural bulunamadı' }, { status: 404 });
    }

    const duplicatedRule: ModerationRule = {
      ...originalRule,
      id: generateId(),
      name: `${originalRule.name} (Kopya)`,
      isActive: false, // Start inactive
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      triggers: 0,
      effectiveness: 0,
    };

    mockRules.unshift(duplicatedRule);

    return HttpResponse.json({
      message: 'Kural başarıyla kopyalandı',
      rule: duplicatedRule,
    });
  }),

  // Get rule templates
  http.get('/api/moderation/rules/templates', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    let filteredTemplates = [...mockTemplates];

    if (category && category !== 'all') {
      filteredTemplates = filteredTemplates.filter(
        (template) => template.category === category
      );
    }

    return HttpResponse.json({
      templates: filteredTemplates,
    });
  }),

  // Create rule from template
  http.post(
    '/api/moderation/rules/templates/:templateId/apply',
    ({ params }) => {
      const template = mockTemplates.find((t) => t.id === params.templateId);

      if (!template) {
        return HttpResponse.json(
          { error: 'Şablon bulunamadı' },
          { status: 404 }
        );
      }

      const newRule: ModerationRule = {
        id: generateId(),
        name: template.name,
        description: template.description,
        category: 'spam_detection',
        severity: 'medium',
        isActive: false, // Start inactive for review
        conditions: template.conditions.map((condition) => ({
          ...condition,
          id: `cond-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })),
        actions: template.actions.map((action) => ({
          ...action,
          id: `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'current_user',
        triggers: 0,
        effectiveness: 0,
      };

      mockRules.unshift(newRule);

      return HttpResponse.json({
        message: 'Şablondan kural oluşturuldu',
        rule: newRule,
      });
    }
  ),

  // Get rule analytics
  http.get('/api/moderation/rules/analytics', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');

    const analytics = { ...mockAnalytics };

    // Filter by category if specified
    if (category && category !== 'all') {
      analytics.topCategories = analytics.topCategories.filter(
        (cat) => cat.category === category
      );
      analytics.performanceMetrics = analytics.performanceMetrics.filter(
        (metric) => {
          const rule = mockRules.find((r) => r.id === metric.ruleId);
          return rule?.category === category;
        }
      );
    }

    return HttpResponse.json({ analytics });
  }),

  // Get rule performance metrics
  http.get('/api/moderation/rules/:id/metrics', ({ params, request }) => {
    const rule = mockRules.find((r) => r.id === params.id);

    if (!rule) {
      return HttpResponse.json({ error: 'Kural bulunamadı' }, { status: 404 });
    }

    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '7d';

    // Generate mock time series data
    const now = new Date();
    const dataPoints = period === '1d' ? 24 : period === '7d' ? 7 : 30;
    const interval = period === '1d' ? 'hour' : 'day';

    const metrics = {
      ruleId: rule.id,
      period,
      interval,
      triggers: Array.from({ length: dataPoints }, (_, i) => ({
        timestamp: new Date(
          now.getTime() -
            (dataPoints - i - 1) * (period === '1d' ? 3600000 : 86400000)
        ).toISOString(),
        count: Math.floor(Math.random() * 20),
      })),
      effectiveness: Array.from({ length: dataPoints }, (_, i) => ({
        timestamp: new Date(
          now.getTime() -
            (dataPoints - i - 1) * (period === '1d' ? 3600000 : 86400000)
        ).toISOString(),
        percentage: Math.floor(Math.random() * 20) + 80,
      })),
      falsePositives: Array.from({ length: dataPoints }, (_, i) => ({
        timestamp: new Date(
          now.getTime() -
            (dataPoints - i - 1) * (period === '1d' ? 3600000 : 86400000)
        ).toISOString(),
        count: Math.floor(Math.random() * 5),
      })),
      summary: {
        totalTriggers: rule.triggers,
        avgEffectiveness: rule.effectiveness,
        falsePositiveRate: 7.6,
        processingTime: 45,
        lastTriggered: new Date(
          now.getTime() - Math.random() * 3600000
        ).toISOString(),
      },
    };

    return HttpResponse.json({ metrics });
  }),

  // Export rules
  http.get('/api/moderation/rules/export', ({ request }) => {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json'; // json, csv, yaml
    const category = url.searchParams.get('category');

    let rulesToExport = [...mockRules];

    if (category && category !== 'all') {
      rulesToExport = rulesToExport.filter(
        (rule) => rule.category === category
      );
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      totalRules: rulesToExport.length,
      format,
      rules: rulesToExport,
    };

    return HttpResponse.json({
      message: 'Kurallar başarıyla dışa aktarıldı',
      data: exportData,
      downloadUrl: `/api/downloads/rules-export-${Date.now()}.${format}`,
    });
  }),

  // Import rules
  http.post('/api/moderation/rules/import', async ({ request }) => {
    const body = (await request.json()) as {
      rules: Partial<ModerationRule>[];
      overwrite?: boolean;
      validateOnly?: boolean;
    };

    const {
      rules: importRules,
      overwrite = false,
      validateOnly = false,
    } = body;

    // Validate rules
    const validationResults = importRules.map((rule, index) => ({
      index,
      rule,
      valid: !!(rule.name && rule.category && rule.conditions && rule.actions),
      errors: [],
    }));

    const validRules = validationResults.filter((result) => result.valid);
    const invalidRules = validationResults.filter((result) => !result.valid);

    if (validateOnly) {
      return HttpResponse.json({
        validation: {
          totalRules: importRules.length,
          validRules: validRules.length,
          invalidRules: invalidRules.length,
          errors: invalidRules,
        },
      });
    }

    // Import valid rules
    const importedRules = validRules.map(
      ({ rule }) =>
        ({
          ...rule,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'current_user',
          triggers: 0,
          effectiveness: 0,
          isActive: false, // Start inactive for review
        }) as ModerationRule
    );

    if (overwrite) {
      // Replace existing rules
      mockRules.length = 0;
      mockRules.push(...importedRules);
    } else {
      // Add to existing rules
      mockRules.unshift(...importedRules);
    }

    return HttpResponse.json({
      message: `${importedRules.length} kural başarıyla içe aktarıldı`,
      imported: importedRules.length,
      skipped: invalidRules.length,
      rules: importedRules,
    });
  }),
];
