'use client';

import { useState, useEffect } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Utensils,
  Car,
  Film,
  Receipt,
  PlusCircle,
  Wallet,
  TrendingUp,
  History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

type Expense = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
};

const CATEGORIES = [
  { name: 'Food', icon: Utensils, color: 'text-blue-500', bg: 'bg-blue-50' },
  { name: 'Transport', icon: Car, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { name: 'Entertainment', icon: Film, color: 'text-amber-500', bg: 'bg-amber-50' },
  { name: 'Bills', icon: Receipt, color: 'text-rose-500', bg: 'bg-rose-50' },
  { name: 'Other', icon: PlusCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
];

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    setMounted(true);
  }, []);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState('');

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const response = await fetch(`/api/expenses?month=${month}&year=${year}`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [currentDate]);

  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !date || !category) return;

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amount: parseFloat(amount),
          date,
          category,
        }),
      });

      if (response.ok) {
        setDescription('');
        setAmount('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setCategory('');
        
        const expenseDate = new Date(date);
        if (
          expenseDate.getMonth() === currentDate.getMonth() &&
          expenseDate.getFullYear() === currentDate.getFullYear()
        ) {
          fetchExpenses();
        }
      }
    } catch (error) {
      console.error('Failed to add expense', error);
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

  const expensesByCategory = CATEGORIES.map(cat => {
    const total = expenses
      .filter(exp => exp.category === cat.name)
      .reduce((sum, exp) => sum + Number(exp.amount), 0);
    return { name: cat.name, total, color: cat.color };
  }).filter(cat => cat.total > 0);

  const getCategoryIcon = (categoryName: string) => {
    const cat = CATEGORIES.find(c => c.name === categoryName);
    return cat ? <cat.icon className={`h-4 w-4 ${cat.color}`} /> : <PlusCircle className="h-4 w-4" />;
  };

  const getCategoryStyles = (categoryName: string) => {
    const cat = CATEGORIES.find(c => c.name === categoryName);
    return cat ? `${cat.bg} ${cat.color}` : 'bg-slate-50 text-slate-500';
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950">
      <nav className="border-b bg-white dark:bg-slate-900 sticky top-0 z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center space-x-2">
            <div className="bg-primary p-2 rounded-lg">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">AI Expense Tracker</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold w-32 text-center text-slate-700 dark:text-slate-200">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 max-w-6xl space-y-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Form & Summary Stats */}
          <div className="md:col-span-4 space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-primary" />
                  Add New Expense
                </CardTitle>
                <CardDescription>Track your spending today</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g., Groceries"
                      className="focus:ring-primary"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Amount ($)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Date</label>
                      <Input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={category} onValueChange={(val) => setCategory(val ?? '')} required>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.name} value={cat.name}>
                            <div className="flex items-center gap-2">
                              <cat.icon className={`h-4 w-4 ${cat.color}`} />
                              <span>{cat.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full shadow-sm hover:shadow-md transition-shadow">
                    Add Expense
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground shadow-lg border-none">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-primary-foreground/80 text-sm font-medium uppercase tracking-wider">Total Spending</p>
                    <h2 className="text-4xl font-bold mt-1">${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                  </div>
                  <TrendingUp className="h-12 w-12 text-primary-foreground/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: List and Chart */}
          <div className="md:col-span-8 space-y-6">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Spending Overview</CardTitle>
                  <CardDescription>Distribution by category</CardDescription>
                </div>
                <div className="bg-slate-100 p-2 rounded-full dark:bg-slate-800">
                  <TrendingUp className="h-5 w-5 text-slate-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4 min-h-[300px]">
                  {expensesByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={expensesByCategory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 12 }}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip 
                          cursor={{ fill: '#f1f5f9' }}
                          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: any) => [`$${Number(value || 0).toFixed(2)}`, 'Total']} 
                        />
                        <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={40}>
                          {expensesByCategory.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-muted-foreground space-y-2 border-2 border-dashed rounded-xl">
                      <History className="h-10 w-10 opacity-20" />
                      <p>No data for this month</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Recent Expenses</CardTitle>
                  <CardDescription>{expenses.length} transactions recorded</CardDescription>
                </div>
                <Button variant="ghost" size="sm" className="text-slate-500">View All</Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : expenses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                    <History className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p>No expenses found for this month.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between py-4 first:pt-0 last:pb-0 group"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2.5 rounded-xl transition-colors ${getCategoryStyles(expense.category)}`}>
                            {getCategoryIcon(expense.category)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100">{expense.description}</p>
                            <p className="text-xs text-slate-500 font-medium">{format(new Date(expense.date), 'MMM dd, yyyy')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900 dark:text-slate-100">
                            -${Number(expense.amount).toFixed(2)}
                          </p>
                          <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{expense.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
