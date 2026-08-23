export function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
