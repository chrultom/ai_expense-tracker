import { test, expect } from '@playwright/test';

test.describe('Expenses API', () => {
  const testExpense = {
    description: 'Playwright Test Expense',
    amount: 123.45,
    date: '2024-03-24T12:00:00.000Z',
    category: 'Entertainment'
  };

  test('POST /api/expenses should create a new expense', async ({ request }) => {
    const response = await request.post('/api/expenses', {
      data: testExpense,
    });

    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.description).toBe(testExpense.description);
    expect(Number(body.amount)).toBe(testExpense.amount);
    expect(body.category).toBe(testExpense.category);
  });

  test('GET /api/expenses should return all expenses', async ({ request }) => {
    const response = await request.get('/api/expenses');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    
    // Check if our test expense exists
    const expense = body.find((e: any) => e.description === testExpense.description);
    expect(expense).toBeDefined();
    expect(Number(expense.amount)).toBe(testExpense.amount);
  });

  test('GET /api/expenses with filters should return filtered expenses', async ({ request }) => {
    // Filter for March 2024 (our test expense date)
    const response = await request.get('/api/expenses?month=3&year=2024');
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    
    const expense = body.find((e: any) => e.description === testExpense.description);
    expect(expense).toBeDefined();
  });

  test('GET /api/expenses for different month should not return our test expense', async ({ request }) => {
    const response = await request.get('/api/expenses?month=1&year=2024');
    expect(response.status()).toBe(200);
    const body = await response.json();
    
    const expense = body.find((e: any) => e.description === testExpense.description);
    expect(expense).toBeUndefined();
  });
});
