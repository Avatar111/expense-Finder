// Unit test for Expense Tracker calculation logic and auto-deduction
import assert from 'assert';

console.log('Testing Expense Tracker Calculation Logic...\n');

// Test Case 1: Initial state
let transactions = [];

function determineFund(newTx, activeFund = 'liquid') {
  let determinedFund = newTx.fundType;
  const method = newTx.paymentMethod || '';

  if (method === 'gpay' || method === 'phonepe' || method === 'paytm' || method === 'bank' || method === 'card') {
    determinedFund = 'bank';
  } else if (method === 'cash') {
    determinedFund = 'liquid';
  } else if (!determinedFund) {
    determinedFund = activeFund === 'all' ? 'liquid' : activeFund;
  }
  return determinedFund;
}

function calculateBalances(txList) {
  let liquidIncome = 0;
  let liquidExpense = 0;
  let bankIncome = 0;
  let bankExpense = 0;

  for (const tx of txList) {
    const amt = Number(tx.amount) || 0;
    if (tx.fundType === 'liquid') {
      if (tx.type === 'income') liquidIncome += amt;
      else if (tx.type === 'expense') liquidExpense += amt;
    } else if (tx.fundType === 'bank') {
      if (tx.type === 'income') bankIncome += amt;
      else if (tx.type === 'expense') bankExpense += amt;
    }
  }

  const liquidBalance = liquidIncome - liquidExpense;
  const bankBalance = bankIncome - bankExpense;
  const totalIncome = liquidIncome + bankIncome;
  const totalExpense = liquidExpense + bankExpense;
  const totalNetBalance = liquidBalance + bankBalance;

  return {
    liquidIncome,
    liquidExpense,
    liquidBalance,
    bankIncome,
    bankExpense,
    bankBalance,
    totalIncome,
    totalExpense,
    totalNetBalance,
  };
}

// 1. Add Liquid Income: ₹10,000
transactions.push({
  id: '1',
  type: 'income',
  fundType: determineFund({ paymentMethod: 'cash' }),
  amount: 10000,
  category: 'salary',
});
let res = calculateBalances(transactions);
assert.strictEqual(res.liquidIncome, 10000);
assert.strictEqual(res.liquidExpense, 0);
assert.strictEqual(res.liquidBalance, 10000, 'Liquid balance should be ₹10,000');
console.log('✓ Test 1: Liquid Income added correctly (Balance: ₹10,000)');

// 2. Add Liquid Expense: ₹2,500 (Automatic deduction from Liquid Income)
transactions.push({
  id: '2',
  type: 'expense',
  fundType: determineFund({ paymentMethod: 'cash' }),
  amount: 2500,
  category: 'food',
});
res = calculateBalances(transactions);
assert.strictEqual(res.liquidIncome, 10000);
assert.strictEqual(res.liquidExpense, 2500);
assert.strictEqual(res.liquidBalance, 7500, 'Expense must automatically deduct from income (10000 - 2500 = 7500)');
console.log('✓ Test 2: Liquid Expense auto-deducted correctly (10000 - 2500 = ₹7,500)');

// 3. Add Bank Income: ₹50,000
transactions.push({
  id: '3',
  type: 'income',
  fundType: determineFund({ paymentMethod: 'bank' }),
  amount: 50000,
  category: 'salary',
});
res = calculateBalances(transactions);
assert.strictEqual(res.bankBalance, 50000);
assert.strictEqual(res.totalNetBalance, 57500, 'Total Net Worth should be Liquid (7500) + Bank (50000) = 57500');
console.log('✓ Test 3: Bank Income added & Total Net Balance calculated correctly (₹57,500)');

// 4. Add Bank Expense: ₹12,000 (Automatic deduction from Bank Income)
transactions.push({
  id: '4',
  type: 'expense',
  fundType: determineFund({ paymentMethod: 'bank' }),
  amount: 12000,
  category: 'bills',
});
res = calculateBalances(transactions);
assert.strictEqual(res.bankBalance, 38000, 'Bank balance must be 50000 - 12000 = 38000');
assert.strictEqual(res.totalNetBalance, 45500, 'Total Net Worth should be 7500 + 38000 = 45500');
console.log('✓ Test 4: Bank Expense auto-deducted correctly (50000 - 12000 = ₹38,000)');

// 5. Transfer Funds: Bank to Cash ATM withdrawal of ₹5,000
// Deducts ₹5000 from Bank, adds ₹5000 to Liquid Cash
transactions.push(
  { id: '5_out', type: 'expense', fundType: 'bank', amount: 5000, category: 'transfer' },
  { id: '5_in', type: 'income', fundType: 'liquid', amount: 5000, category: 'transfer' }
);
res = calculateBalances(transactions);
assert.strictEqual(res.liquidBalance, 12500, 'Liquid balance should increase by 5000: 7500 + 5000 = 12500');
assert.strictEqual(res.bankBalance, 33000, 'Bank balance should decrease by 5000: 38000 - 5000 = 33000');
assert.strictEqual(res.totalNetBalance, 45500, 'Total Net Worth should remain constant at 45500');
console.log('✓ Test 5: Transfer between Bank and Liquid Cash balances correctly (Liquid: ₹12,500, Bank: ₹33,000, Total: ₹45,500)');

// 6. Google Pay Payment: ₹2,000
// MUST deduct directly from Bank Account, leaving Liquid Cash completely unchanged!
const gpayFund = determineFund({ paymentMethod: 'gpay' });
assert.strictEqual(gpayFund, 'bank', 'Google Pay payment MUST strictly have fundType bank');
transactions.push({
  id: '6_gpay',
  type: 'expense',
  fundType: gpayFund,
  paymentMethod: 'gpay',
  amount: 2000,
  category: 'shopping',
  description: 'Google Pay വഴി തുണി വാങ്ങിയത്',
});
res = calculateBalances(transactions);
assert.strictEqual(res.liquidBalance, 12500, 'Liquid Cash must remain completely untouched at ₹12,500!');
assert.strictEqual(res.bankBalance, 31000, 'Bank balance must decrease by ₹2,000: 33000 - 2000 = 31000');
assert.strictEqual(res.totalNetBalance, 43500, 'Total Net Worth should be 12500 + 31000 = 43500');
console.log('✓ Test 6: Google Pay expense strictly deducts from Bank Account and leaves Liquid Cash untouched! (Bank: ₹31,000, Liquid: ₹12,500)');

// 7. Cash Payment: ₹1,500
// MUST deduct directly from Liquid Cash, leaving Bank Account completely unchanged!
const cashFund = determineFund({ paymentMethod: 'cash' });
assert.strictEqual(cashFund, 'liquid', 'Cash payment MUST strictly have fundType liquid');
transactions.push({
  id: '7_cash',
  type: 'expense',
  fundType: cashFund,
  paymentMethod: 'cash',
  amount: 1500,
  category: 'food',
  description: 'ഹോട്ടൽ ഭക്ഷണം കയ്യിൽ നിന്ന് കാശ് കൊടുത്തു',
});
res = calculateBalances(transactions);
assert.strictEqual(res.liquidBalance, 11000, 'Liquid Cash must decrease by ₹1,500: 12500 - 1500 = 11000');
assert.strictEqual(res.bankBalance, 31000, 'Bank balance must remain completely untouched at ₹31,000!');
assert.strictEqual(res.totalNetBalance, 42000, 'Total Net Worth should be 11000 + 31000 = 42000');
console.log('✓ Test 7: Cash expense strictly deducts from Liquid Cash and leaves Bank Account untouched! (Liquid: ₹11,000, Bank: ₹31,000)');

console.log('\nAll 7 automated calculation and fund separation tests passed successfully! 🎉');
