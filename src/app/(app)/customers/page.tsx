import { Users } from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, Td, Th } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { listCustomers } from "@/lib/data";
import { createCustomerAction } from "../actions";

export default async function CustomersPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const customers = await listCustomers(params.q);

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Track customer contact details and social handles."
      />
      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add customer</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createCustomerAction} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input name="phone" placeholder="Phone" />
                <Input name="city" placeholder="City" />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input name="instagram_username" placeholder="Instagram" />
                <Input name="facebook_name" placeholder="Facebook" />
              </div>
              <Textarea name="address" placeholder="Address" />
              <Textarea name="notes" placeholder="Notes" />
              <Button type="submit">Save customer</Button>
            </form>
          </CardContent>
        </Card>
        <div>
          <form className="mb-3">
            <Input name="q" placeholder="Search name, phone, Instagram, Facebook" defaultValue={params.q ?? ""} />
          </form>
          {customers.length === 0 ? (
            <EmptyState icon={Users} title="No customers found" description="Add a customer or adjust your search." />
          ) : (
            <Card>
              <Table>
                <thead>
                  <tr>
                    <Th>Name</Th>
                    <Th>Phone</Th>
                    <Th>Social</Th>
                    <Th>City</Th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <Td className="font-medium">{customer.name}</Td>
                      <Td>{customer.phone ?? "-"}</Td>
                      <Td>{customer.instagram_username ?? customer.facebook_name ?? "-"}</Td>
                      <Td>{customer.city ?? "-"}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
