'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Switch } from '@/components/ui/Switch';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Progress } from '@/components/ui/Progress';
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
  Brain,
  Filter,
  Settings,
  Activity,
  RefreshCw,
  Save,
  Plus,
  Minus,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';

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

const AutomatedFiltering: React.FC = () => {
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [filterStats, setFilterStats] = useState<FilterStats | null>(null);
  const [mlModels, setMLModels] = useState<MLModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newRule, setNewRule] = useState<Partial<FilterRule>>({
    name: '',
    type: 'keyword',
    category: 'spam',
    severity: 'medium',
    action: 'flag',
    isActive: true,
    conditions: [''],
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [rulesRes, statsRes, modelsRes] = await Promise.all([
          fetch('/api/admin/filtering/rules'),
          fetch('/api/admin/filtering/stats'),
          fetch('/api/admin/filtering/models'),
        ]);

        const [rules, stats, models] = await Promise.all([
          rulesRes.json(),
          statsRes.json(),
          modelsRes.json(),
        ]);

        setFilterRules(rules.data || []);
        setFilterStats(stats.data || null);
        setMLModels(models.data || []);
      } catch (error) {
        console.error('Failed to fetch filtering data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSaveRule = async () => {
    if (!newRule.name || !newRule.conditions?.length) return;

    try {
      setSaving(true);
      const response = await fetch('/api/admin/filtering/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRule,
          conditions: newRule.conditions?.filter((c) => c.trim()),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setFilterRules((prev) => [result.data, ...prev]);
        setNewRule({
          name: '',
          type: 'keyword',
          category: 'spam',
          severity: 'medium',
          action: 'flag',
          isActive: true,
          conditions: [''],
        });
      }
    } catch (error) {
      console.error('Failed to save rule:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleRule = async (ruleId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/filtering/rules/${ruleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (response.ok) {
        setFilterRules((prev) =>
          prev.map((rule) =>
            rule.id === ruleId ? { ...rule, isActive } : rule
          )
        );
      }
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const handleRetrainModel = async (modelName: string) => {
    try {
      const response = await fetch(
        `/api/admin/filtering/models/${modelName}/retrain`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        setMLModels((prev) =>
          prev.map((model) =>
            model.name === modelName
              ? { ...model, status: 'training' as const }
              : model
          )
        );
      }
    } catch (error) {
      console.error('Failed to retrain model:', error);
    }
  };

  const addCondition = () => {
    setNewRule((prev) => ({
      ...prev,
      conditions: [...(prev.conditions || []), ''],
    }));
  };

  const removeCondition = (index: number) => {
    setNewRule((prev) => ({
      ...prev,
      conditions: prev.conditions?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateCondition = (index: number, value: string) => {
    setNewRule((prev) => ({
      ...prev,
      conditions:
        prev.conditions?.map((c, i) => (i === index ? value : c)) || [],
    }));
  };

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
      case 'spam':
        return <Filter className="h-4 w-4" />;
      case 'inappropriate':
        return <AlertTriangle className="h-4 w-4" />;
      case 'hate':
        return <AlertCircle className="h-4 w-4" />;
      case 'violence':
        return <Shield className="h-4 w-4" />;
      case 'adult':
        return <AlertTriangle className="h-4 w-4" />;
      case 'scam':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Filter className="h-4 w-4" />;
    }
  };

  const getModelStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'training':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'disabled':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
        <span>Filtreleme verileri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Otomatik İçerik Filtreleme
          </h1>
          <p className="text-gray-600">
            Spam tespiti ve uygunsuz içerik filtreleme sistemi
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
          <Button className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Ayarlar
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {filterStats && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Toplam İşlenen</p>
                  <p className="text-2xl font-bold">
                    {filterStats.totalProcessed.toLocaleString()}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Spam Tespit</p>
                  <p className="text-2xl font-bold text-red-600">
                    {filterStats.spamDetected.toLocaleString()}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Doğruluk Oranı</p>
                  <p className="text-2xl font-bold text-green-600">
                    {filterStats.accuracy}%
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
                  <p className="text-sm text-gray-600">İşlem Süresi</p>
                  <p className="text-2xl font-bold">
                    {filterStats.avgProcessingTime}ms
                  </p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="rules" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rules">Filtre Kuralları</TabsTrigger>
          <TabsTrigger value="ml-models">ML Modelleri</TabsTrigger>
          <TabsTrigger value="keywords">Anahtar Kelimeler</TabsTrigger>
          <TabsTrigger value="analytics">Analitik</TabsTrigger>
        </TabsList>

        {/* Filter Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          {/* Create New Rule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 h-5 w-5" />
                Yeni Filtre Kuralı Ekle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label htmlFor="rule-name">Kural Adı</Label>
                  <Input
                    id="rule-name"
                    value={newRule.name || ''}
                    onChange={(e) =>
                      setNewRule((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Örn: Spam Kelime Filtresi"
                  />
                </div>

                <div>
                  <Label htmlFor="rule-type">Kural Tipi</Label>
                  <Select
                    value={newRule.type}
                    onValueChange={(value) =>
                      setNewRule((prev) => ({
                        ...prev,
                        type: value as FilterRule['type'],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="keyword">Anahtar Kelime</SelectItem>
                      <SelectItem value="pattern">Regex Deseni</SelectItem>
                      <SelectItem value="ml">Makine Öğrenmesi</SelectItem>
                      <SelectItem value="domain">Domain Kontrolü</SelectItem>
                      <SelectItem value="image">Görsel Analizi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rule-category">Kategori</Label>
                  <Select
                    value={newRule.category}
                    onValueChange={(value) =>
                      setNewRule((prev) => ({
                        ...prev,
                        category: value as FilterRule['category'],
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="inappropriate">
                        Uygunsuz İçerik
                      </SelectItem>
                      <SelectItem value="hate">Nefret Söylemi</SelectItem>
                      <SelectItem value="violence">Şiddet</SelectItem>
                      <SelectItem value="adult">Yetişkin İçerik</SelectItem>
                      <SelectItem value="scam">Dolandırıcılık</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="rule-severity">Önem Derecesi</Label>
                  <Select
                    value={newRule.severity}
                    onValueChange={(value) =>
                      setNewRule((prev) => ({
                        ...prev,
                        severity: value as FilterRule['severity'],
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
              </div>

              <div>
                <Label htmlFor="rule-action">Aksiyon</Label>
                <Select
                  value={newRule.action}
                  onValueChange={(value) =>
                    setNewRule((prev) => ({
                      ...prev,
                      action: value as FilterRule['action'],
                    }))
                  }
                >
                  <SelectTrigger className="md:w-1/4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flag">İşaretle</SelectItem>
                    <SelectItem value="hide">Gizle</SelectItem>
                    <SelectItem value="remove">Kaldır</SelectItem>
                    <SelectItem value="escalate">
                      Yöneticiye Yönlendir
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Koşullar</Label>
                <div className="space-y-2">
                  {newRule.conditions?.map((condition, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={condition}
                        onChange={(e) => updateCondition(index, e.target.value)}
                        placeholder={
                          newRule.type === 'keyword'
                            ? 'Anahtar kelime girin'
                            : newRule.type === 'pattern'
                              ? 'Regex deseni girin'
                              : 'Koşul girin'
                        }
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCondition(index)}
                        disabled={newRule.conditions?.length === 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCondition}
                    className="flex items-center"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Koşul Ekle
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={newRule.isActive}
                    onCheckedChange={(checked) =>
                      setNewRule((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label>Kuralı Aktif Et</Label>
                </div>
                <Button
                  onClick={handleSaveRule}
                  disabled={saving || !newRule.name}
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
            </CardContent>
          </Card>

          {/* Existing Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Mevcut Filtre Kuralları</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filterRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="space-y-3 rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center space-x-2">
                          {getCategoryIcon(rule.category)}
                          <h3 className="font-medium">{rule.name}</h3>
                          <Badge
                            variant="outline"
                            className={`${getSeverityColor(rule.severity)} text-white`}
                          >
                            {rule.severity}
                          </Badge>
                          <Badge variant="secondary">{rule.type}</Badge>
                          <Badge variant="outline">{rule.action}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Kategori: {rule.category}</span>
                          <span>Güven: {rule.confidence}%</span>
                          <span>
                            Oluşturulma:{' '}
                            {new Date(rule.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2">
                          <span className="text-sm font-medium">
                            Koşullar:{' '}
                          </span>
                          <span className="text-sm text-gray-600">
                            {rule.conditions.join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={(checked) =>
                            handleToggleRule(rule.id, checked)
                          }
                        />
                        <Button variant="outline" size="sm">
                          Düzenle
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ML Models Tab */}
        <TabsContent value="ml-models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="mr-2 h-5 w-5" />
                Makine Öğrenmesi Modelleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mlModels.map((model) => (
                  <div key={model.name} className="rounded-lg border p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center space-x-2">
                          {getModelStatusIcon(model.status)}
                          <h3 className="font-medium">{model.name}</h3>
                          <Badge variant="outline">v{model.version}</Badge>
                          <Badge variant="secondary">{model.type}</Badge>
                        </div>
                        <div className="mb-2 flex items-center space-x-4 text-sm text-gray-600">
                          <span>Doğruluk: {model.accuracy}%</span>
                          <span>
                            Son Eğitim:{' '}
                            {new Date(model.lastTrained).toLocaleDateString()}
                          </span>
                          <span>Durum: {model.status}</span>
                        </div>
                        <Progress
                          value={model.accuracy}
                          className="h-2 w-full"
                        />
                      </div>
                      <div className="ml-4 flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetrainModel(model.name)}
                          disabled={model.status === 'training'}
                        >
                          {model.status === 'training' ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Eğitiliyor...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Yeniden Eğit
                            </>
                          )}
                        </Button>
                        <Button variant="outline" size="sm">
                          Ayarlar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Anahtar Kelime Yönetimi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="bulk-keywords">
                    Toplu Anahtar Kelime Ekleme
                  </Label>
                  <Textarea
                    id="bulk-keywords"
                    placeholder="Her satıra bir anahtar kelime yazın..."
                    rows={6}
                  />
                </div>
                <div className="flex justify-between">
                  <Select defaultValue="spam">
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spam">Spam</SelectItem>
                      <SelectItem value="inappropriate">
                        Uygunsuz İçerik
                      </SelectItem>
                      <SelectItem value="hate">Nefret Söylemi</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Save className="mr-2 h-4 w-4" />
                    Anahtar Kelimeleri Kaydet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Filtreleme Analitikleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-8 text-center text-gray-500">
                <Activity className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>Filtreleme analitikleri yakında eklenecek...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomatedFiltering;
