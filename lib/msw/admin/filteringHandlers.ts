import { http, HttpResponse } from 'msw';

interface FilterRule {
  id: string;
  name: string;
  type: 'keyword' | 'pattern' | 'ml' | 'domain' | 'image';
  category: 'spam' | 'inappropriate' | 'hate' | 'violence' | 'adult' | 'scam';
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'flag' | 'hide' | 'remove' | 'escalate';
  isActive: boolean;
  conditions: string[];
  confidence: number;
  createdAt: string;
}

interface FilterStats {
  totalProcessed: number;
  spamDetected: number;
  inappropriateContent: number;
  falsePositives: number;
  accuracy: number;
  avgProcessingTime: number;
  lastUpdate: string;
}

interface MLModelInfo {
  name: string;
  version: string;
  accuracy: number;
  lastTrained: string;
  status: 'active' | 'training' | 'disabled';
  type: 'text' | 'image' | 'behavior';
}

// Mock data generators
const generateFilterRules = (): FilterRule[] => [
  {
    id: 'rule-1',
    name: 'Spam Kelime Filtresi',
    type: 'keyword',
    category: 'spam',
    severity: 'high',
    action: 'remove',
    isActive: true,
    conditions: ['ücretsiz para', 'hemen kazanç', 'garanti kar'],
    confidence: 92,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'rule-2',
    name: 'Uygunsuz Dil Tespiti',
    type: 'ml',
    category: 'inappropriate',
    severity: 'medium',
    action: 'flag',
    isActive: true,
    conditions: ['toxic_language_model'],
    confidence: 87,
    createdAt: '2024-01-14T15:30:00Z',
  },
  {
    id: 'rule-3',
    name: 'Nefret Söylemi Filtresi',
    type: 'pattern',
    category: 'hate',
    severity: 'critical',
    action: 'escalate',
    isActive: true,
    conditions: ['\\b(nefret|ayrımcılık)\\w*\\b'],
    confidence: 95,
    createdAt: '2024-01-13T09:15:00Z',
  },
  {
    id: 'rule-4',
    name: 'Şüpheli Domain Kontrolü',
    type: 'domain',
    category: 'scam',
    severity: 'high',
    action: 'remove',
    isActive: true,
    conditions: ['suspicious-site.com', 'fake-offers.net'],
    confidence: 98,
    createdAt: '2024-01-12T14:20:00Z',
  },
  {
    id: 'rule-5',
    name: 'Uygunsuz Görsel Tespiti',
    type: 'image',
    category: 'adult',
    severity: 'critical',
    action: 'remove',
    isActive: false,
    conditions: ['nsfw_image_classifier'],
    confidence: 89,
    createdAt: '2024-01-11T11:45:00Z',
  },
  {
    id: 'rule-6',
    name: 'Şiddet İçerik Filtresi',
    type: 'keyword',
    category: 'violence',
    severity: 'high',
    action: 'hide',
    isActive: true,
    conditions: ['şiddet', 'zarar ver', 'öldür'],
    confidence: 94,
    createdAt: '2024-01-10T16:00:00Z',
  },
  {
    id: 'rule-7',
    name: 'Dolandırıcılık Tespiti',
    type: 'ml',
    category: 'scam',
    severity: 'critical',
    action: 'escalate',
    isActive: true,
    conditions: ['fraud_detection_model'],
    confidence: 91,
    createdAt: '2024-01-09T13:30:00Z',
  },
  {
    id: 'rule-8',
    name: 'Yetişkin İçerik Kelime Filtresi',
    type: 'keyword',
    category: 'adult',
    severity: 'medium',
    action: 'flag',
    isActive: true,
    conditions: ['yetişkin', 'müstehcen', 'pornografi'],
    confidence: 88,
    createdAt: '2024-01-08T12:15:00Z',
  },
];

const generateFilterStats = (): FilterStats => ({
  totalProcessed: 1245892,
  spamDetected: 23456,
  inappropriateContent: 8934,
  falsePositives: 234,
  accuracy: 97.8,
  avgProcessingTime: 45,
  lastUpdate: new Date().toISOString(),
});

const generateMLModels = (): MLModelInfo[] => [
  {
    name: 'spam_detector_v2',
    version: '2.1.4',
    accuracy: 97.8,
    lastTrained: '2024-01-20T10:00:00Z',
    status: 'active',
    type: 'text',
  },
  {
    name: 'toxicity_classifier',
    version: '1.8.2',
    accuracy: 94.3,
    lastTrained: '2024-01-18T14:30:00Z',
    status: 'active',
    type: 'text',
  },
  {
    name: 'image_content_filter',
    version: '3.0.1',
    accuracy: 92.7,
    lastTrained: '2024-01-15T16:45:00Z',
    status: 'training',
    type: 'image',
  },
  {
    name: 'behavior_anomaly_detector',
    version: '1.5.3',
    accuracy: 89.2,
    lastTrained: '2024-01-12T11:20:00Z',
    status: 'active',
    type: 'behavior',
  },
  {
    name: 'fraud_detection_ensemble',
    version: '2.3.0',
    accuracy: 96.1,
    lastTrained: '2024-01-10T09:15:00Z',
    status: 'disabled',
    type: 'text',
  },
];

// Mock data storage
let mockFilterRules = generateFilterRules();
let mockFilterStats = generateFilterStats();
const mockMLModels = generateMLModels();

export const filteringHandlers = [
  // Get all filter rules
  http.get('/api/admin/filtering/rules', async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return HttpResponse.json({
      success: true,
      data: mockFilterRules,
    });
  }),

  // Create new filter rule
  http.post('/api/admin/filtering/rules', async ({ request }) => {
    const ruleData = (await request.json()) as Partial<FilterRule>;

    await new Promise((resolve) => setTimeout(resolve, 800));

    const newRule: FilterRule = {
      id: `rule-${Date.now()}`,
      name: ruleData.name || '',
      type: ruleData.type || 'keyword',
      category: ruleData.category || 'spam',
      severity: ruleData.severity || 'medium',
      action: ruleData.action || 'flag',
      isActive: ruleData.isActive ?? true,
      conditions: ruleData.conditions || [],
      confidence: Math.floor(Math.random() * 20) + 80, // 80-99%
      createdAt: new Date().toISOString(),
    };

    mockFilterRules.unshift(newRule);

    return HttpResponse.json({
      success: true,
      data: newRule,
      message: 'Filtre kuralı başarıyla oluşturuldu',
    });
  }),

  // Update filter rule
  http.patch('/api/admin/filtering/rules/:id', async ({ params, request }) => {
    const { id } = params;
    const updateData = (await request.json()) as Partial<FilterRule>;

    await new Promise((resolve) => setTimeout(resolve, 300));

    const ruleIndex = mockFilterRules.findIndex((rule) => rule.id === id);

    if (ruleIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Filtre kuralı bulunamadı',
        },
        { status: 404 }
      );
    }

    mockFilterRules[ruleIndex] = {
      ...mockFilterRules[ruleIndex],
      ...updateData,
    };

    return HttpResponse.json({
      success: true,
      data: mockFilterRules[ruleIndex],
      message: 'Filtre kuralı güncellendi',
    });
  }),

  // Delete filter rule
  http.delete('/api/admin/filtering/rules/:id', async ({ params }) => {
    const { id } = params;

    await new Promise((resolve) => setTimeout(resolve, 400));

    const ruleIndex = mockFilterRules.findIndex((rule) => rule.id === id);

    if (ruleIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Filtre kuralı bulunamadı',
        },
        { status: 404 }
      );
    }

    const deletedRule = mockFilterRules.splice(ruleIndex, 1)[0];

    return HttpResponse.json({
      success: true,
      data: deletedRule,
      message: 'Filtre kuralı silindi',
    });
  }),

  // Get filtering statistics
  http.get('/api/admin/filtering/stats', async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Update stats with some variation
    mockFilterStats = {
      ...mockFilterStats,
      totalProcessed:
        mockFilterStats.totalProcessed + Math.floor(Math.random() * 100),
      spamDetected:
        mockFilterStats.spamDetected + Math.floor(Math.random() * 10),
      inappropriateContent:
        mockFilterStats.inappropriateContent + Math.floor(Math.random() * 5),
      falsePositives:
        mockFilterStats.falsePositives + Math.floor(Math.random() * 2),
      accuracy: Math.round((97 + Math.random() * 2) * 10) / 10,
      avgProcessingTime: Math.floor(40 + Math.random() * 20),
      lastUpdate: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: mockFilterStats,
    });
  }),

  // Get ML models
  http.get('/api/admin/filtering/models', async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return HttpResponse.json({
      success: true,
      data: mockMLModels,
    });
  }),

  // Retrain ML model
  http.post(
    '/api/admin/filtering/models/:modelName/retrain',
    async ({ params }) => {
      const { modelName } = params;

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const modelIndex = mockMLModels.findIndex(
        (model) => model.name === modelName
      );

      if (modelIndex === -1) {
        return HttpResponse.json(
          {
            success: false,
            message: 'Model bulunamadı',
          },
          { status: 404 }
        );
      }

      // Set model to training status
      mockMLModels[modelIndex] = {
        ...mockMLModels[modelIndex],
        status: 'training',
        lastTrained: new Date().toISOString(),
      };

      // Simulate training completion after 30 seconds
      setTimeout(() => {
        const currentModelIndex = mockMLModels.findIndex(
          (model) => model.name === modelName
        );
        if (currentModelIndex !== -1) {
          mockMLModels[currentModelIndex] = {
            ...mockMLModels[currentModelIndex],
            status: 'active',
            accuracy:
              Math.round(
                (mockMLModels[currentModelIndex].accuracy + Math.random() * 2) *
                  10
              ) / 10,
            version: incrementVersion(mockMLModels[currentModelIndex].version),
          };
        }
      }, 30000);

      return HttpResponse.json({
        success: true,
        data: mockMLModels[modelIndex],
        message: 'Model eğitimi başlatıldı',
      });
    }
  ),

  // Update ML model settings
  http.patch(
    '/api/admin/filtering/models/:modelName',
    async ({ params, request }) => {
      const { modelName } = params;
      const updateData = (await request.json()) as Partial<MLModelInfo>;

      await new Promise((resolve) => setTimeout(resolve, 300));

      const modelIndex = mockMLModels.findIndex(
        (model) => model.name === modelName
      );

      if (modelIndex === -1) {
        return HttpResponse.json(
          {
            success: false,
            message: 'Model bulunamadı',
          },
          { status: 404 }
        );
      }

      mockMLModels[modelIndex] = {
        ...mockMLModels[modelIndex],
        ...updateData,
      };

      return HttpResponse.json({
        success: true,
        data: mockMLModels[modelIndex],
        message: 'Model ayarları güncellendi',
      });
    }
  ),

  // Bulk import keywords
  http.post(
    '/api/admin/filtering/keywords/bulk-import',
    async ({ request }) => {
      const { keywords, category, severity } = (await request.json()) as {
        keywords: string[];
        category: FilterRule['category'];
        severity: FilterRule['severity'];
      };

      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Create keyword rules from bulk import
      const newRules = keywords
        .filter((keyword) => keyword.trim())
        .map((keyword, index) => ({
          id: `rule-bulk-${Date.now()}-${index}`,
          name: `Anahtar Kelime: ${keyword.trim()}`,
          type: 'keyword' as const,
          category,
          severity,
          action: 'flag' as const,
          isActive: true,
          conditions: [keyword.trim()],
          confidence: Math.floor(Math.random() * 20) + 75, // 75-94%
          createdAt: new Date().toISOString(),
        }));

      mockFilterRules = [...newRules, ...mockFilterRules];

      return HttpResponse.json({
        success: true,
        data: newRules,
        message: `${newRules.length} anahtar kelime kuralı oluşturuldu`,
      });
    }
  ),

  // Test content against filters
  http.post('/api/admin/filtering/test', async ({ request }) => {
    const { content, contentType } = (await request.json()) as {
      content: string;
      contentType: 'text' | 'image' | 'mixed';
    };

    await new Promise((resolve) => setTimeout(resolve, 600));

    // Simulate content filtering
    const results = {
      isBlocked: false,
      confidence: 0,
      matchedRules: [] as string[],
      riskLevel: 'low' as 'low' | 'medium' | 'high' | 'critical',
      reasons: [] as string[],
    };

    // Check against active rules
    const activeRules = mockFilterRules.filter((rule) => rule.isActive);

    for (const rule of activeRules) {
      if (rule.type === 'keyword') {
        for (const condition of rule.conditions) {
          if (content.toLowerCase().includes(condition.toLowerCase())) {
            results.matchedRules.push(rule.id);
            results.reasons.push(`"${condition}" kelimesi tespit edildi`);
            results.confidence = Math.max(results.confidence, rule.confidence);

            if (rule.severity === 'critical' || rule.severity === 'high') {
              results.isBlocked = true;
              results.riskLevel = rule.severity;
            }
          }
        }
      }
    }

    // Simulate ML model results
    if (contentType === 'text') {
      const spamProbability = Math.random();
      if (spamProbability > 0.8) {
        results.matchedRules.push('ml-spam-detector');
        results.reasons.push('Spam olasılığı yüksek');
        results.confidence = Math.max(results.confidence, 85);
      }
    }

    return HttpResponse.json({
      success: true,
      data: results,
    });
  }),
];

// Helper function to increment version
function incrementVersion(version: string): string {
  const parts = version.split('.');
  const patch = parseInt(parts[2]) + 1;
  return `${parts[0]}.${parts[1]}.${patch}`;
}
