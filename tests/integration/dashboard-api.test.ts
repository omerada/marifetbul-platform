/**
 * Dashboard API Integration Tests
 * Tests for /api/dashboard/freelancer and /api/dashboard/employer routes
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

describe('Dashboard API Integration', () => {
  let freelancerToken: string;
  let employerToken: string;

  beforeAll(async () => {
    // Login as freelancer to get token
    const freelancerLogin = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'freelancer@test.com',
        password: 'Test123!',
      }),
    });
    const freelancerData = await freelancerLogin.json();
    freelancerToken = freelancerData.data?.accessToken || '';

    // Login as employer to get token
    const employerLogin = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'employer@test.com',
        password: 'Test123!',
      }),
    });
    const employerData = await employerLogin.json();
    employerToken = employerData.data?.accessToken || '';
  });

  describe('Freelancer Dashboard', () => {
    it('should fetch freelancer dashboard data', async () => {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/freelancer`, {
        headers: {
          Authorization: `Bearer ${freelancerToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');

      // Verify transformed data structure
      expect(data.data).toHaveProperty('stats');
      expect(data.data.stats).toHaveProperty('totalEarnings');
      expect(data.data.stats).toHaveProperty('activeOrders');
      expect(data.data.stats).toHaveProperty('completedJobs');
    });

    it('should support days query parameter', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/dashboard/freelancer?days=7`,
        {
          headers: {
            Authorization: `Bearer ${freelancerToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/freelancer`);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });

    it('should handle backend errors gracefully', async () => {
      // Use invalid token to trigger backend error
      const response = await fetch(`${API_BASE_URL}/api/dashboard/freelancer`, {
        headers: {
          Authorization: 'Bearer invalid-token',
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBeGreaterThanOrEqual(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data).toHaveProperty('error');
    });
  });

  describe('Employer Dashboard', () => {
    it('should fetch employer dashboard data', async () => {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/employer`, {
        headers: {
          Authorization: `Bearer ${employerToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('data');

      // Verify transformed data structure
      expect(data.data).toHaveProperty('stats');
      expect(data.data.stats).toHaveProperty('totalSpent');
      expect(data.data.stats).toHaveProperty('activeJobs');
      expect(data.data.stats).toHaveProperty('completedJobs');
    });

    it('should support days query parameter', async () => {
      const response = await fetch(
        `${API_BASE_URL}/api/dashboard/employer?days=30`,
        {
          headers: {
            Authorization: `Bearer ${employerToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should return 401 without auth token', async () => {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/employer`);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  describe('Dashboard Refresh', () => {
    it('should refresh freelancer dashboard', async () => {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/freelancer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${freelancerToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should refresh employer dashboard', async () => {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/employer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${employerToken}`,
          'Content-Type': 'application/json',
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });
  });

  describe('Data Transformation', () => {
    it('should transform backend DTO to frontend type', async () => {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/freelancer`, {
        headers: {
          Authorization: `Bearer ${freelancerToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      const dashboard = data.data;

      // Check frontend type structure (not backend DTO)
      expect(dashboard).toHaveProperty('stats'); // Not 'metrics'
      expect(dashboard).toHaveProperty('quickStats');
      expect(dashboard).toHaveProperty('recentOrders');
      expect(dashboard).toHaveProperty('recentProposals');
      expect(dashboard).toHaveProperty('analytics');

      // Verify field mappings
      expect(typeof dashboard.stats.totalEarnings).toBe('number');
      expect(typeof dashboard.stats.activeOrders).toBe('number');
      expect(typeof dashboard.stats.completedJobs).toBe('number');
    });

    it('should handle missing optional fields', async () => {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/employer`, {
        headers: {
          Authorization: `Bearer ${employerToken}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      const dashboard = data.data;

      // These should exist even if backend doesn't provide them
      expect(dashboard).toHaveProperty('stats');
      expect(dashboard).toHaveProperty('activeJobs');
      expect(dashboard).toHaveProperty('recentJobs');
      expect(Array.isArray(dashboard.activeJobs)).toBe(true);
      expect(Array.isArray(dashboard.recentJobs)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should respond within acceptable time', async () => {
      const startTime = Date.now();

      const response = await fetch(`${API_BASE_URL}/api/dashboard/freelancer`, {
        headers: {
          Authorization: `Bearer ${freelancerToken}`,
          'Content-Type': 'application/json',
        },
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(3000); // 3 seconds max
    });
  });
});
