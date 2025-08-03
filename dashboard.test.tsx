import { render, screen, waitFor, act } from '@testing-library/react';
import Dashboard from './components/pages/dashboard';
import axios from 'axios';
import React from 'react';

// Mock getApiUrl function
jest.mock('@/lib/config', () => ({
  getApiUrl: (path: string) => `http://localhost:3001${path}`
}));

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Dashboard Component', () => {
  const mockStatsResponse = {
    success: true,
    stats: {
      users: {
        total: 150,
        verified: 120,
        unverified: 30,
        newToday: 5,
        newThisMonth: 45,
        newLastMonth: 35,
        monthlyGrowth: 28.6
      },
      deposits: {
        total: 75,
        pending: 8,
        confirmed: 67,
        totalAmount: 125000.50
      },
      participations: {
        total: 300,
        pending: 12,
        approved: 280,
        rejected: 8
      },
      referrals: {
        total: 45,
        completed: 40,
        pending: 5
      },
      withdrawals: {
        total: 25,
        pending: 3,
        completed: 22,
        totalAmount: 85000.00
      },
      balance: {
        total: 125000.50
      },
      recentActivity: {
        users: 15,
        deposits: 5,
        participations: 20,
        withdrawals: 2
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockedAxios.get.mockResolvedValue({ data: mockStatsResponse });
  });

  test('shows loading state initially', () => {
    render(<Dashboard />);
    expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
  });

  test('renders dashboard statistics correctly', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument(); // Total Users
      expect(screen.getByText('8')).toBeInTheDocument(); // Pending Deposits
      expect(screen.getByText('12')).toBeInTheDocument(); // Pending Participations
      expect(screen.getByText('3')).toBeInTheDocument(); // Pending Withdrawals
    });

    // Check for dashboard titles
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('Pending Deposits')).toBeInTheDocument();
    expect(screen.getByText('Pending Participations')).toBeInTheDocument();
    expect(screen.getByText('Pending Withdraws')).toBeInTheDocument();
  });

  test('displays recent activity correctly', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      expect(screen.getByText('15 users joined')).toBeInTheDocument();
      expect(screen.getByText('5 deposits made')).toBeInTheDocument();
      expect(screen.getByText('20 tasks completed')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      // Should show dashboard with no stats cards when error occurs
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Welcome to your admin dashboard')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch dashboard stats:', expect.any(Error));
    consoleSpy.mockRestore();
  });

  test('displays growth percentage correctly', async () => {
    await act(async () => {
      render(<Dashboard />);
    });

    await waitFor(() => {
      expect(screen.getByText('+28.6% from last month')).toBeInTheDocument();
    });
  });
});
