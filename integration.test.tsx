import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import React from 'react';
import DepositRequests from './components/pages/deposit-requests';
import Dashboard from './components/pages/dashboard';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Integration Tests - Deposit and Referral Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('complete deposit approval workflow with referral tracking', async () => {
    // Mock initial deposit requests data
    const initialDeposits = [
      {
        id: '1',
        user: { 
          name: 'John Doe',
          email: 'john@example.com',
          referredBy: 'Alice Smith' // User was referred
        },
        amount: '2000',
        status: 'Pending',
        receipt: 'receipt1.jpg',
        createdAt: '2024-01-15T10:00:00Z'
      }
    ];

    // Mock dashboard stats before approval
    const initialStats = {
      users: 100,
      deposits: 45,
      participations: 200,
      referrals: 23,
      withdrawals: 15,
      balance: '85000.00',
      pendingDeposits: 1,
      pendingParticipations: 5,
    };

    // Mock dashboard stats after approval (referral should be counted)
    const updatedStats = {
      users: 100,
      deposits: 46, // Increased by 1
      participations: 200,
      referrals: 24, // Increased by 1 (referral completed)
      withdrawals: 15,
      balance: '87000.00', // Increased by deposit amount
      pendingDeposits: 0, // Decreased by 1
      pendingParticipations: 5,
    };

    // Setup initial API responses
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/admin/deposit-requests')) {
        return Promise.resolve({ data: initialDeposits });
      }
      if (url.includes('/api/admin/dashboard-stats')) {
        return Promise.resolve({ data: initialStats });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    // Mock successful approval response
    mockedAxios.post.mockResolvedValue({ data: { success: true } });

    // Render deposit requests component
    const { rerender } = render(<DepositRequests />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('$2,000')).toBeInTheDocument();
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    // Find and click approve button
    const approveButton = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approveButton);

    // Verify approval API call was made
    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/deposit-requests/1/approve'
      );
    });

    // Mock updated data after approval
    const approvedDeposits = [
      {
        ...initialDeposits[0],
        status: 'Approved'
      }
    ];

    // Update mock to return approved data
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/admin/deposit-requests')) {
        return Promise.resolve({ data: approvedDeposits });
      }
      if (url.includes('/api/admin/dashboard-stats')) {
        return Promise.resolve({ data: updatedStats });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    // Rerender to simulate data refresh
    rerender(<DepositRequests />);

    // Verify status updated to approved
    await waitFor(() => {
      expect(screen.getByText('Approved')).toBeInTheDocument();
    });

    // Now test dashboard with updated stats
    render(<Dashboard />);

    // Verify dashboard shows updated statistics
    await waitFor(() => {
      expect(screen.getByText('46')).toBeInTheDocument(); // Updated deposits
      expect(screen.getByText('24')).toBeInTheDocument(); // Updated referrals
      expect(screen.getByText('$87,000.00')).toBeInTheDocument(); // Updated balance
    });

    // Verify pending deposits alert is gone (was 1, now 0)
    expect(screen.queryByText(/1 pending deposits/)).not.toBeInTheDocument();
  });

  test('referral logic validation - deposit without referrer', async () => {
    // Mock deposit without referrer
    const depositWithoutReferrer = [
      {
        id: '2',
        user: { 
          name: 'Jane Smith',
          email: 'jane@example.com',
          referredBy: null // No referrer
        },
        amount: '1500',
        status: 'Pending',
        receipt: 'receipt2.jpg',
        createdAt: '2024-01-15T11:00:00Z'
      }
    ];

    const statsBeforeApproval = {
      users: 100,
      deposits: 46,
      participations: 200,
      referrals: 24,
      withdrawals: 15,
      balance: '87000.00',
      pendingDeposits: 1,
      pendingParticipations: 5,
    };

    // Stats after approval - referrals should NOT increase
    const statsAfterApproval = {
      users: 100,
      deposits: 47, // Increased by 1
      participations: 200,
      referrals: 24, // Should remain the same (no referrer)
      withdrawals: 15,
      balance: '88500.00', // Increased by deposit amount
      pendingDeposits: 0,
      pendingParticipations: 5,
    };

    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/admin/deposit-requests')) {
        return Promise.resolve({ data: depositWithoutReferrer });
      }
      if (url.includes('/api/admin/dashboard-stats')) {
        return Promise.resolve({ data: statsBeforeApproval });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    mockedAxios.post.mockResolvedValue({ data: { success: true } });

    render(<DepositRequests />);

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    // Approve the deposit
    const approveButton = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approveButton);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://localhost:3001/api/admin/deposit-requests/2/approve'
      );
    });

    // Update mock for dashboard test
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes('/api/admin/dashboard-stats')) {
        return Promise.resolve({ data: statsAfterApproval });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    // Test dashboard
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('47')).toBeInTheDocument(); // Deposits increased
      expect(screen.getByText('24')).toBeInTheDocument(); // Referrals unchanged
      expect(screen.getByText('$88,500.00')).toBeInTheDocument(); // Balance updated
    });
  });

  test('error handling for failed deposit approval', async () => {
    const pendingDeposit = [
      {
        id: '3',
        user: { name: 'Bob Wilson', email: 'bob@example.com' },
        amount: '3000',
        status: 'Pending',
        receipt: 'receipt3.jpg',
      }
    ];

    mockedAxios.get.mockResolvedValue({ data: pendingDeposit });
    mockedAxios.post.mockRejectedValue(new Error('Server error'));

    render(<DepositRequests />);

    await waitFor(() => {
      expect(screen.getByText('Bob Wilson')).toBeInTheDocument();
    });

    const approveButton = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approveButton);

    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
