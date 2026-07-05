import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, Td, Th } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, formatMoney } from "@/lib/format";
import { listExpenses } from "@/lib/data";
import { createExpenseAction } from "../actions";

export default async function ExpensesPage() {
  const expenses = await listExpenses();

  return (
    <div>
      <PageHeader title="Expenses" description="Record materials, packaging, shipping, ads, tools, and other costs." />
      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader><CardTitle>Add expense</CardTitle></CardHeader>
          <CardContent>
            <form action={createExpenseAction} className="space-y-3">
              <div className="space-y-2"><Label>Date</Label><Input name="expense_date" type="date" required /></div>
              <Select name="category" defaultValue="materials">
                {["materials", "packaging", "shipping", "ads", "tools", "other"].map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
              <Input name="amount" type="number" min="0" step="0.01" placeholder="Amount" required />
              <Input name="description" placeholder="Description" required />
              <Textarea name="notes" placeholder="Notes" />
              <Button type="submit">Add expense</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <Table>
            <thead><tr><Th>Date</Th><Th>Category</Th><Th>Description</Th><Th>Amount</Th></tr></thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <Td>{formatDate(expense.expense_date)}</Td>
                  <Td>{expense.category}</Td>
                  <Td>{expense.description}</Td>
                  <Td>{formatMoney(expense.amount)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
