import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import DepositRequests from './components/pages/deposit-requests';
import axios from 'axios';
import React from 'react';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DepositRequests Component', () => {
  const mockDepositsResponse = {
    success: true,
    deposits: [
      {
        _id: '1',
        userId: 'user1',
        amount: 1000,
        status: 'pending',
        receiptUrl: 'receipt1.jpg',
        createdAt: '2024-01-15T10:00:00Z',
        user: {
          username: 'Alice',
          email: 'alice@example.com'
        }
      },
      {
        _id: '2',
        userId: 'user2', 
        amount: 1500,
        status: 'confirmed',
        receiptUrl: 'receipt2.jpg',
        createdAt: '2024-01-15T11:00:00Z',
        user: {
          username: 'Bob',
          email: 'bob@example.com'
        }
      },
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock the deposits API endpoint
    mockedAxios.get.mockResolvedValue({ data: mockDepositsResponse });
  });

  test('renders loading state initially', () => {
    render(<DepositRequests />);
    expect(screen.getByText('Loading deposit requests...')).toBeInTheDocument();
  });

test('renders deposit requests and shows user information correctly', async () =e {
    await act(async () => {
      render(<DepositRequests />);
    });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
expect(screen.getByText('1000.00')).toBeInTheDocument();
      expect(screen.getByText('1500.00')).toBeInTheDocument();
    });
  });

test('handles deposit approval for Alice', async () =e {
mockedAxios.put.mockResolvedValue({ data: { success: true } });
    mockedAxios.get.mockResolvedValue({ data: mockDepositsResponse });
    
    await act(async () => {
      render(<DepositRequests />);
    });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // Find and click approve button for pending deposit
    const approveButtons = screen.getAllByText('Approve');
    await act(async () => {
      fireEvent.click(approveButtons[0]);
    });

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/deposits/1/confirm')
      );
    });
  });

test('handles deposit rejection for Alice', async () =e {
mockedAxios.put.mockResolvedValue({ data: { success: true } });
    mockedAxios.get.mockResolvedValue({ data: mockDepositsResponse });
    
    await act(async () => {
      render(<DepositRequests />);
    });

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    // Find and click reject button for pending deposit
    const rejectButtons = screen.getAllByText('Reject');
    await act(async () => {
      fireEvent.click(rejectButtons[0]);
    });

    await waitFor(() => {
      expect(mockedAxios.put).toHaveBeenCalledWith(
        expect.stringContaining('/api/admin/deposits/1/reject')
      );
    });
  });

  test('handles API error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockedAxios.get.mockRejectedValue(new Error('API Error'));
    
    await act(async () => {
      render(<DepositRequests />);
    });

    await waitFor(() => {
      expect(screen.getByText('No deposit requests found')).toBeInTheDocument();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch deposits:', expect.any(Error));
    consoleSpy.mockRestore();
  });
});

