'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import {
  AlertTriangle,
  Shield,
  Zap,
  Settings,
  Plus,
  Minus,
  RefreshCw,
  Save,
  Eye,
  Edit,
  Trash2,
  Copy,
  Play,
  Pause,
  BarChart3,
  Code,
  Search,
  CheckCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';

interface RuleCondition {
  id: string;
  type:
    | 'keyword'
    | 'pattern'
    | 'user_behavior'
    | 'content_type'
    | 'time_based'
    | 'metadata';
  field: string;
  operator:
    | 'contains'
    | 'equals'
    | 'starts_with'
    | 'ends_with'
    | 'regex'
    | 'greater_than'
    | 'less_than'
    | 'in_range';
  value: string | number | string[];
  caseSensitive?: boolean;
  weight?: number;
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
  delay?: number; // minutes
  expiry?: number; // minutes
}

interface ModerationRule {
  id: string;
  name: string;
  description: string;
  category:
    | 'content_quality'
    | 'spam_detection'
    | 'user_behavior'
    | 'community_guidelines'
    | 'safety'
    | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: number;
  isActive: boolean;
  conditions: RuleCondition[];
  actions: RuleAction[];
  logicOperator: 'AND' | 'OR';
  triggerCount: number;
  triggerWindow: number; // minutes
  confidenceThreshold: number; // 0-100
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  triggerStats: {
    totalTriggers: number;
    successfulActions: number;
    falsePositives: number;
    accuracy: number;
  };
}

interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: Partial<ModerationRule>;
}

interface RulesStats {
  totalRules: number;
  activeRules: number;
  totalTriggers: number;
  averageAccuracy: number;
  topPerformingRules: string[];
  recentActivity: Array<{
    ruleId: string;
    ruleName: string;
    action: string;
    timestamp: string;
  }>;
}

const ModerationRulesEngine: React.FC = () => {
  const [rules, setRules] = useState<ModerationRule[]>([]);
  const [templates, setTemplates] = useState<RuleTemplate[]>([]);
  const [stats, setStats] = useState<RulesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('rules');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // New rule form state
  const [newRule, setNewRule] = useState<Partial<ModerationRule>>({
    name: '',
    description: '',
    category: 'custom',
    severity: 'medium',
    priority: 50,
    isActive: true,
    conditions: [],
    actions: [],
    logicOperator: 'AND',
    triggerCount: 1,
    triggerWindow: 60,
    confidenceThreshold: 80,
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rulesRes, templatesRes, statsRes] = await Promise.all([
          fetch('/api/admin/moderation/rules'),
          fetch('/api/admin/moderation/rules/templates'),
          fetch('/api/admin/moderation/rules/stats'),
        ]);

        const [rulesData, templatesData, statsData] = await Promise.all([
          rulesRes.json(),
          templatesRes.json(),
          statsRes.json(),
        ]);

        setRules(rulesData.data || []);
        setTemplates(templatesData.data || []);
        setStats(statsData.data || null);
      } catch (error) {
        console.error('Failed to fetch rules data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveRule = async () => {
    if (
      !newRule.name ||
      !newRule.conditions?.length ||
      !newRule.actions?.length
    ) {
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/admin/moderation/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRule,
          createdBy: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setRules((prev) => [result.data, ...prev]);
        resetNewRule();
      }
    } catch (error) {
      console.error('Failed to save rule:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/moderation/rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setRules((prev) =>
          prev.map((rule) =>
            rule.id === ruleId
              ? { ...rule, isActive, updatedAt: new Date().toISOString() }
              : rule
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Bu kuralı silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await fetch(`/api/admin/moderation/rules/${ruleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRules((prev) => prev.filter((rule) => rule.id !== ruleId));
      }
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  const handleCloneRule = (rule: ModerationRule) => {
    setNewRule({
      ...rule,
      id: undefined,
      name: `${rule.name} (Kopya)`,
      createdAt: undefined,
      updatedAt: undefined,
      lastTriggered: undefined,
      triggerStats: undefined,
    });
    setActiveTab('create');
  };

  const handleLoadTemplate = (template: RuleTemplate) => {
    setNewRule({
      ...template.template,
      name: template.name,
      description: template.description,
      category: 'spam_detection',
    });
  };

  const addCondition = () => {
    const newCondition: RuleCondition = {
      id: `condition-${Date.now()}`,
      type: 'keyword',
      field: 'content',
      operator: 'contains',
      value: '',
      weight: 1,
    };
    setNewRule((prev) => ({
      ...prev,
      conditions: [...(prev.conditions || []), newCondition],
    }));
  };

  const removeCondition = (conditionId: string) => {
    setNewRule((prev) => ({
      ...prev,
      conditions: prev.conditions?.filter((c) => c.id !== conditionId) || [],
    }));
  };

  const updateCondition = (
    conditionId: string,
    updates: Partial<RuleCondition>
  ) => {
    setNewRule((prev) => ({
      ...prev,
      conditions:
        prev.conditions?.map((c) =>
          c.id === conditionId ? { ...c, ...updates } : c
        ) || [],
    }));
  };

  const addAction = () => {
    const newAction: RuleAction = {
      id: `action-${Date.now()}`,
      type: 'flag',
      target: 'content',
    };
    setNewRule((prev) => ({
      ...prev,
      actions: [...(prev.actions || []), newAction],
    }));
  };

  const removeAction = (actionId: string) => {
    setNewRule((prev) => ({
      ...prev,
      actions: prev.actions?.filter((a) => a.id !== actionId) || [],
    }));
  };

  const updateAction = (actionId: string, updates: Partial<RuleAction>) => {
    setNewRule((prev) => ({
      ...prev,
      actions:
        prev.actions?.map((a) =>
          a.id === actionId ? { ...a, ...updates } : a
        ) || [],
    }));
  };

  const resetNewRule = () => {
    setNewRule({
      name: '',
      description: '',
      category: 'custom',
      severity: 'medium',
      priority: 50,
      isActive: true,
      conditions: [],
      actions: [],
      logicOperator: 'AND',
      triggerCount: 1,
      triggerWindow: 60,
      confidenceThreshold: 80,
    });
  };

  const filteredRules = rules.filter((rule) => {
    const matchesSearch =
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || rule.category === categoryFilter;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && rule.isActive) ||
      (statusFilter === 'inactive' && !rule.isActive);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'content_quality':
        return <Shield className="h-4 w-4" />;
      case 'spam_detection':
        return <AlertTriangle className="h-4 w-4" />;
      case 'user_behavior':
        return <BarChart3 className="h-4 w-4" />;
      case 'community_guidelines':
        return <CheckCircle className="h-4 w-4" />;
      case 'safety':
        return <Shield className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
        <span>Kural verileri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Moderasyon Kuralları Motoru
          </h1>
          <p className="text-gray-600">
            Otomatik moderasyon kuralları oluşturun ve yönetin
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
          <Button
            className="flex items-center"
            onClick={() => setActiveTab('create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Yeni Kural
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Kural</p>
                  <p className="text-2xl font-bold">{stats.totalRules}</p>
                </div>
                <Settings className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Aktif Kurallar</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.activeRules}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam Tetikleme</p>
                  <p className="text-2xl font-bold">
                    {stats.totalTriggers.toLocaleString()}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ortalama Doğruluk</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.averageAccuracy}%
                  </p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue={activeTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Kurallar</TabsTrigger>
          <TabsTrigger value="create">Kural Oluştur</TabsTrigger>
          <TabsTrigger value="templates">Şablonlar</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
        </TabsList>

        {/* Rules List Tab */}
        <TabsContent value="rules" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="min-w-64 flex-1">
                  <div className="relative">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                    <Input
                      placeholder="Kural adı veya açıklama ara..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    <SelectItem value="content_quality">
                      İçerik Kalitesi
                    </SelectItem>
                    <SelectItem value="spam_detection">Spam Tespiti</SelectItem>
                    <SelectItem value="user_behavior">
                      Kullanıcı Davranışı
                    </SelectItem>
                    <SelectItem value="community_guidelines">
                      Topluluk Kuralları
                    </SelectItem>
                    <SelectItem value="safety">Güvenlik</SelectItem>
                    <SelectItem value="custom">Özel</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Durum" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Pasif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Rules List */}
          <div className="space-y-4">
            {filteredRules.map((rule) => (
              <Card key={rule.id} className={rule.isActive ? '' : 'opacity-60'}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-3">
                        {getCategoryIcon(rule.category)}
                        <h3 className="text-lg font-semibold">{rule.name}</h3>
                        <Badge
                          variant="outline"
                          className={`${getSeverityColor(rule.severity)} text-white`}
                        >
                          {rule.severity}
                        </Badge>
                        <Badge variant="secondary">{rule.category}</Badge>
                        {rule.isActive ? (
                          <Badge
                            variant="outline"
                            className="bg-green-500 text-white"
                          >
                            <Play className="mr-1 h-3 w-3" />
                            Aktif
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-gray-500 text-white"
                          >
                            <Pause className="mr-1 h-3 w-3" />
                            Pasif
                          </Badge>
                        )}
                      </div>

                      <p className="mb-3 text-gray-600">{rule.description}</p>

                      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-gray-500">Koşullar</p>
                          <p className="font-medium">
                            {rule.conditions.length} koşul ({rule.logicOperator}
                            )
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Aksiyonlar</p>
                          <p className="font-medium">
                            {rule.actions.length} aksiyon
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Öncelik</p>
                          <p className="font-medium">{rule.priority}/100</p>
                        </div>
                      </div>

                      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                        <div>
                          <p className="text-sm text-gray-500">Tetikleme</p>
                          <p className="text-sm">
                            {rule.triggerStats.totalTriggers.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Başarılı</p>
                          <p className="text-sm">
                            {rule.triggerStats.successfulActions.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Doğruluk</p>
                          <p className="text-sm">
                            {rule.triggerStats.accuracy}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Son Tetikleme</p>
                          <p className="text-sm">
                            {rule.lastTriggered
                              ? new Date(
                                  rule.lastTriggered
                                ).toLocaleDateString()
                              : 'Hiç'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>Oluşturan: {rule.createdBy}</span>
                        <span>
                          Oluşturulma:{' '}
                          {new Date(rule.createdAt).toLocaleDateString()}
                        </span>
                        <span>
                          Güncelleme:{' '}
                          {new Date(rule.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="ml-4 flex items-center space-x-2">
                      <Switch
                        checked={rule.isActive}
                        onCheckedChange={(checked) =>
                          handleToggleRule(rule.id, checked)
                        }
                      />

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Detayları Görüntüle
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleCloneRule(rule)}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Kopyala
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteRule(rule.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Sil
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredRules.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Settings className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">
                    Filtrelerinize uygun kural bulunamadı.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Create Rule Tab */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Yeni Moderasyon Kuralı Oluştur
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="rule-name">Kural Adı *</Label>
                  <Input
                    id="rule-name"
                    value={newRule.name || ''}
                    onChange={(e) =>
                      setNewRule((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Örn: Spam İçerik Tespiti"
                  />
                </div>

                <div>
                  <Label htmlFor="rule-category">Kategori</Label>
                  <Select
                    value={newRule.category}
                    onValueChange={(value) =>
                      setNewRule((prev) => ({
                        ...prev,
                        category: value as
                          | 'user_behavior'
                          | 'content_quality'
                          | 'spam_detection'
                          | 'community_guidelines'
                          | 'safety'
                          | 'custom',
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content_quality">
                        İçerik Kalitesi
                      </SelectItem>
                      <SelectItem value="spam_detection">
                        Spam Tespiti
                      </SelectItem>
                      <SelectItem value="user_behavior">
                        Kullanıcı Davranışı
                      </SelectItem>
                      <SelectItem value="community_guidelines">
                        Topluluk Kuralları
                      </SelectItem>
                      <SelectItem value="safety">Güvenlik</SelectItem>
                      <SelectItem value="custom">Özel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="rule-description">Açıklama</Label>
                <Textarea
                  id="rule-description"
                  value={newRule.description || ''}
                  onChange={(e) =>
                    setNewRule((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Bu kuralın ne yaptığını açıklayın..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="rule-severity">Önem Derecesi</Label>
                  <Select
                    value={newRule.severity}
                    onValueChange={(value) =>
                      setNewRule((prev) => ({
                        ...prev,
                        severity: value as
                          | 'low'
                          | 'medium'
                          | 'high'
                          | 'critical',
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Düşük</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="critical">Kritik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rule-priority">Öncelik (0-100)</Label>
                  <Input
                    id="rule-priority"
                    type="number"
                    min="0"
                    max="100"
                    value={newRule.priority || 50}
                    onChange={(e) =>
                      setNewRule((prev) => ({
                        ...prev,
                        priority: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="rule-confidence">Güven Eşiği (%)</Label>
                  <Input
                    id="rule-confidence"
                    type="number"
                    min="0"
                    max="100"
                    value={newRule.confidenceThreshold || 80}
                    onChange={(e) =>
                      setNewRule((prev) => ({
                        ...prev,
                        confidenceThreshold: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>

              {/* Conditions Section */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Koşullar</h3>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={newRule.logicOperator}
                      onValueChange={(value) =>
                        setNewRule((prev) => ({
                          ...prev,
                          logicOperator: value as 'AND' | 'OR',
                        }))
                      }
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">VE</SelectItem>
                        <SelectItem value="OR">VEYA</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={addCondition} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Koşul Ekle
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {newRule.conditions?.map((condition, index) => (
                    <div
                      key={condition.id}
                      className="space-y-3 rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Koşul {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(condition.id)}
                          disabled={newRule.conditions?.length === 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                        <Select
                          value={condition.type}
                          onValueChange={(value) =>
                            updateCondition(condition.id, {
                              type: value as
                                | 'keyword'
                                | 'pattern'
                                | 'user_behavior'
                                | 'content_type'
                                | 'time_based'
                                | 'metadata',
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Tip" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="keyword">
                              Anahtar Kelime
                            </SelectItem>
                            <SelectItem value="pattern">
                              Regex Deseni
                            </SelectItem>
                            <SelectItem value="user_behavior">
                              Kullanıcı Davranışı
                            </SelectItem>
                            <SelectItem value="content_type">
                              İçerik Tipi
                            </SelectItem>
                            <SelectItem value="time_based">
                              Zaman Bazlı
                            </SelectItem>
                            <SelectItem value="metadata">Metadata</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Alan"
                          value={condition.field}
                          onChange={(e) =>
                            updateCondition(condition.id, {
                              field: e.target.value,
                            })
                          }
                        />

                        <Select
                          value={condition.operator}
                          onValueChange={(value) =>
                            updateCondition(condition.id, {
                              operator: value as
                                | 'equals'
                                | 'contains'
                                | 'greater_than'
                                | 'less_than'
                                | 'regex',
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Operatör" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="contains">İçerir</SelectItem>
                            <SelectItem value="equals">Eşittir</SelectItem>
                            <SelectItem value="starts_with">
                              İle Başlar
                            </SelectItem>
                            <SelectItem value="ends_with">İle Biter</SelectItem>
                            <SelectItem value="regex">Regex</SelectItem>
                            <SelectItem value="greater_than">
                              Büyüktür
                            </SelectItem>
                            <SelectItem value="less_than">Küçüktür</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Değer"
                          value={
                            typeof condition.value === 'string'
                              ? condition.value
                              : ''
                          }
                          onChange={(e) =>
                            updateCondition(condition.id, {
                              value: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}

                  {!newRule.conditions?.length && (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 py-8 text-center">
                      <Code className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">
                        Henüz koşul eklenmedi. Yukarıdan &quot;Koşul Ekle&quot;
                        butonunu kullanın.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Section */}
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-medium">Aksiyonlar</h3>
                  <Button type="button" onClick={addAction} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Aksiyon Ekle
                  </Button>
                </div>

                <div className="space-y-3">
                  {newRule.actions?.map((action, index) => (
                    <div
                      key={action.id}
                      className="space-y-3 rounded-lg border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Aksiyon {index + 1}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAction(action.id)}
                          disabled={newRule.actions?.length === 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <Select
                          value={action.type}
                          onValueChange={(value) =>
                            updateAction(action.id, {
                              type: value as
                                | 'flag'
                                | 'hide'
                                | 'remove'
                                | 'escalate'
                                | 'auto_approve'
                                | 'require_review'
                                | 'notify'
                                | 'block_user'
                                | 'restrict_user',
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Aksiyon Tipi" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="flag">İşaretle</SelectItem>
                            <SelectItem value="hide">Gizle</SelectItem>
                            <SelectItem value="remove">Kaldır</SelectItem>
                            <SelectItem value="escalate">Yönlendir</SelectItem>
                            <SelectItem value="auto_approve">
                              Otomatik Onayla
                            </SelectItem>
                            <SelectItem value="require_review">
                              İnceleme Gerektir
                            </SelectItem>
                            <SelectItem value="notify">
                              Bildirim Gönder
                            </SelectItem>
                            <SelectItem value="block_user">
                              Kullanıcıyı Engelle
                            </SelectItem>
                            <SelectItem value="restrict_user">
                              Kullanıcıyı Kısıtla
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={action.target}
                          onValueChange={(value) =>
                            updateAction(action.id, {
                              target: value as 'content' | 'user' | 'moderator',
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Hedef" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="content">İçerik</SelectItem>
                            <SelectItem value="user">Kullanıcı</SelectItem>
                            <SelectItem value="moderator">Moderatör</SelectItem>
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Gecikme (dk)"
                          type="number"
                          value={action.delay || ''}
                          onChange={(e) =>
                            updateAction(action.id, {
                              delay: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>
                  ))}

                  {!newRule.actions?.length && (
                    <div className="rounded-lg border-2 border-dashed border-gray-300 py-8 text-center">
                      <Zap className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">
                        Henüz aksiyon eklenmedi. Yukarıdan &quot;Aksiyon
                        Ekle&quot; butonunu kullanın.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newRule.isActive}
                    onCheckedChange={(checked) =>
                      setNewRule((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label>Kuralı Aktif Olarak Kaydet</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={resetNewRule}>
                    Temizle
                  </Button>
                  <Button
                    onClick={handleSaveRule}
                    disabled={
                      saving ||
                      !newRule.name ||
                      !newRule.conditions?.length ||
                      !newRule.actions?.length
                    }
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Kuralı Kaydet
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kural Şablonları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="space-y-3 rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{template.name}</h3>
                      <Badge variant="secondary">{template.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {template.description}
                    </p>
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleLoadTemplate(template)}
                    >
                      Şablonu Kullan
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Kural Analitikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-gray-500">
                <BarChart3 className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>Kural analitikleri yakında eklenecek...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ModerationRulesEngine;
