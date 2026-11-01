import React from 'react';
import { Users, Mail, Phone, Calendar } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatPaise, formatDate } from '@/lib/utils/format';

export const metadata = {
  title: 'Client Directory | SHRÎ Admin',
};

interface CustomerRow {
  id: string;
  fullName: string;
  phone: string;
  createdDate: string;
  ordersCount: number;
  totalSpentPaise: number;
}

export default async function AdminCustomersPage() {
  let customers: CustomerRow[] = [];

  try {
    const admin = createAdminClient();

    // Query profiles from Supabase
    const { data: profiles, error: profileError } = await admin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profiles && profiles.length > 0) {
      // Query all orders to aggregate customer spending & order count
      const { data: orders } = await admin
        .from('orders')
        .select('user_id, total_paise, status, payment_status');

      customers = profiles.map((p: any) => {
        const userOrders = orders?.filter((o: any) => o.user_id === p.id) || [];
        const qualifyingOrders = userOrders.filter(
          (o: any) => o.payment_status === 'captured' || o.status === 'confirmed' || o.status === 'delivered'
        );
        const totalSpent = qualifyingOrders.reduce((sum: number, o: any) => sum + (o.total_paise || 0), 0);

        return {
          id: p.id,
          fullName: p.full_name || 'Inscribed Client',
          phone: p.phone || '—',
          createdDate: formatDate(p.created_at),
          ordersCount: userOrders.length,
          totalSpentPaise: totalSpent,
        };
      });
    }
  } catch (err) {
    console.error('Error fetching customers in admin:', err);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4 flex justify-between items-center">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
            Client Registry
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
            Customer Directory
          </h1>
        </div>
        <span className="text-xs text-charcoal-muted font-medium">
          {customers.length} Inscribed {customers.length === 1 ? 'Client' : 'Clients'}
        </span>
      </div>

      <div className="bg-ivory border border-sand/70 p-6 shadow-xs overflow-x-auto">
        {customers.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Users className="w-10 h-10 text-sand mx-auto stroke-1" />
            <h3 className="font-serif text-base text-charcoal">No Registered Clients Yet</h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              When clients create accounts via mobile OTP or place orders with the atelier, their profile and lifetime purchase metrics will appear here.
            </p>
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-sand text-charcoal-muted uppercase tracking-wider text-[10px] bg-cream/40">
                <th className="py-3 px-3">Client Name</th>
                <th className="py-3 px-3">Registered Phone</th>
                <th className="py-3 px-3">Inscribed Date</th>
                <th className="py-3 px-3">Total Orders</th>
                <th className="py-3 px-3 text-right">Lifetime Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/40">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-cream/40 transition-colors">
                  <td className="py-3 px-3 font-medium text-charcoal">
                    {c.fullName}
                  </td>
                  <td className="py-3 px-3 font-mono text-charcoal-muted">
                    {c.phone}
                  </td>
                  <td className="py-3 px-3 text-charcoal-muted">
                    {c.createdDate}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-charcoal">{c.ordersCount}</span>{' '}
                    <span className="text-charcoal-muted text-[11px]">
                      {c.ordersCount === 1 ? 'Order' : 'Orders'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-charcoal">
                    {formatPaise(c.totalSpentPaise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
