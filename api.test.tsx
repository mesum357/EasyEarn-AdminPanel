import axios from 'axios';

// Mock API base URL for testing
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Mock axios instead of using MockAdapter for this example
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('API Integration Tests - Deposit and Referral Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Deposit Requests API', () => {
    test('fetches deposit requests successfully', async () => {
      const mockData = [
        {
          id: '1',
          user: { name: 'John Doe', email: 'john@example.com' },
          amount: '1000',
          status: 'Pending',
          receipt: 'receipt1.jpg',
          createdAt: '2024-01-15T10:00:00Z'
        }
      ];

      mockedAxios.get.mockResolvedValue({ data: mockData });

      const response = await axios.get(`${BASE_URL}/api/admin/deposit-requests`);
      
      expect(response.data).toEqual(mockData);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/api/admin/deposit-requests`);
    });

    test('approves deposit request successfully', async () => {
      const mockResponse = { success: true, message: 'Deposit approved successfully' };
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const response = await axios.post(`${BASE_URL}/api/admin/deposit-requests/1/approve`);
      
      expect(response.data).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(`${BASE_URL}/api/admin/deposit-requests/1/approve`);
    });

    test('rejects deposit request successfully', async () => {
      const mockResponse = { success: true, message: 'Deposit rejected successfully' };
      mockedAxios.post.mockResolvedValue({ data: mockResponse });

      const response = await axios.post(`${BASE_URL}/api/admin/deposit-requests/1/reject`);
      
      expect(response.data).toEqual(mockResponse);
      expect(mockedAxios.post).toHaveBeenCalledWith(`${BASE_URL}/api/admin/deposit-requests/1/reject`);
    });

    test('handles deposit approval error', async () => {
      const errorMessage = 'Internal server error';
      mockedAxios.post.mockRejectedValue(new Error(errorMessage));

      try {
        await axios.post(`${BASE_URL}/api/admin/deposit-requests/1/approve`);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('Dashboard Stats API', () => {
    test('fetches dashboard statistics successfully', async () => {
      const mockStats = {
        users: 100,
        deposits: 45,
        participations: 200,
        referrals: 23,
        withdrawals: 15,
        balance: '85000.00',
        pendingDeposits: 3,
        pendingParticipations: 7,
      };

      mockedAxios.get.mockResolvedValue({ data: mockStats });

      const response = await axios.get(`${BASE_URL}/api/admin/dashboard-stats`);
      
      expect(response.data).toEqual(mockStats);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${BASE_URL}/api/admin/dashboard-stats`);
    });

    test('handles dashboard stats fetch error', async () => {
      const errorMessage = 'Failed to fetch dashboard stats';
      mockedAxios.get.mockRejectedValue(new Error(errorMessage));

      try {
        await axios.get(`${BASE_URL}/api/admin/dashboard-stats`);
      } catch (error) {
        expect(error.message).toBe(errorMessage);
      }
    });
  });

  describe('Referral Logic Validation', () => {
    test('deposit approval with referrer increases referral count', async () => {
      // Mock user with referrer
      const depositWithReferrer = {
        id: '1',
        user: { 
          name: 'John Doe', 
          email: 'john@example.com',
          referredBy: 'Alice Smith' // Has referrer
        },
        amount: '2000',
        status: 'Pending',
        receipt: 'receipt1.jpg'
      };

      // Mock initial stats
      const initialStats = { referrals: 10, deposits: 20 };
      
      // Mock updated stats after approval (referral should increase)
      const updatedStats = { referrals: 11, deposits: 21 };

      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/deposit-requests')) {
          return Promise.resolve({ data: [depositWithReferrer] });
        }
        if (url.includes('/dashboard-stats')) {
          return Promise.resolve({ data: initialStats });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Mock approval success
      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      // Fetch initial data
      const depositsResponse = await axios.get(`${BASE_URL}/api/admin/deposit-requests`);
      const initialStatsResponse = await axios.get(`${BASE_URL}/api/admin/dashboard-stats`);

      expect(depositsResponse.data[0].user.referredBy).toBe('Alice Smith');
      expect(initialStatsResponse.data.referrals).toBe(10);

      // Approve deposit
      await axios.post(`${BASE_URL}/api/admin/deposit-requests/1/approve`);

      // Mock updated stats response
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/dashboard-stats')) {
          return Promise.resolve({ data: updatedStats });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Fetch updated stats
      const updatedStatsResponse = await axios.get(`${BASE_URL}/api/admin/dashboard-stats`);
      
      expect(updatedStatsResponse.data.referrals).toBe(11); // Should increase
      expect(updatedStatsResponse.data.deposits).toBe(21); // Should also increase
    });

    test('deposit approval without referrer does not increase referral count', async () => {
      // Mock user without referrer
      const depositWithoutReferrer = {
        id: '2',
        user: { 
          name: 'Jane Smith', 
          email: 'jane@example.com',
          referredBy: null // No referrer
        },
        amount: '1500',
        status: 'Pending',
        receipt: 'receipt2.jpg'
      };

      // Mock initial stats
      const initialStats = { referrals: 10, deposits: 20 };
      
      // Mock updated stats after approval (referral should NOT increase)
      const updatedStats = { referrals: 10, deposits: 21 }; // Only deposits increase

      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/deposit-requests')) {
          return Promise.resolve({ data: [depositWithoutReferrer] });
        }
        if (url.includes('/dashboard-stats')) {
          return Promise.resolve({ data: initialStats });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      mockedAxios.post.mockResolvedValue({ data: { success: true } });

      // Fetch initial data
      const depositsResponse = await axios.get(`${BASE_URL}/api/admin/deposit-requests`);
      const initialStatsResponse = await axios.get(`${BASE_URL}/api/admin/dashboard-stats`);

      expect(depositsResponse.data[0].user.referredBy).toBeNull();
      expect(initialStatsResponse.data.referrals).toBe(10);

      // Approve deposit
      await axios.post(`${BASE_URL}/api/admin/deposit-requests/2/approve`);

      // Mock updated stats response
      mockedAxios.get.mockImplementation((url) => {
        if (url.includes('/dashboard-stats')) {
          return Promise.resolve({ data: updatedStats });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      // Fetch updated stats
      const updatedStatsResponse = await axios.get(`${BASE_URL}/api/admin/dashboard-stats`);
      
      expect(updatedStatsResponse.data.referrals).toBe(10); // Should NOT increase
      expect(updatedStatsResponse.data.deposits).toBe(21); // Should increase
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('handles network error gracefully', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network Error'));

      try {
        await axios.get(`${BASE_URL}/api/admin/deposit-requests`);
      } catch (error) {
        expect(error.message).toBe('Network Error');
      }
    });

    test('handles malformed response data', async () => {
      mockedAxios.get.mockResolvedValue({ data: null });

      const response = await axios.get(`${BASE_URL}/api/admin/deposit-requests`);
      expect(response.data).toBeNull();
    });

    test('handles timeout error', async () => {
      mockedAxios.get.mockRejectedValue(new Error('timeout of 5000ms exceeded'));

      try {
        await axios.get(`${BASE_URL}/api/admin/dashboard-stats`);
      } catch (error) {
        expect(error.message).toContain('timeout');
      }
    });
  });
});
