import React from 'react';
import { History, ShieldAlert } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/utils/format';

export const metadata = {
  title: 'Audit Trail & Compliance | SHRÎ Admin',
};

export default async function AdminAuditLogsPage() {
  let auditLogs: any[] = [];

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      auditLogs = data;
    }
  } catch (err) {
    console.error('Failed to query audit logs:', err);
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-sand pb-4">
        <span className="text-[10px] uppercase tracking-widest text-gold font-semibold block">
          Security & Traceability
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl text-charcoal font-normal">
          Atelier System Audit Trail
        </h1>
      </div>

      <div className="bg-ivory border border-sand/70 p-6 shadow-xs overflow-x-auto">
        {auditLogs.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <History className="w-10 h-10 text-sand mx-auto stroke-1" />
            <h3 className="font-serif text-base text-charcoal">No Audit Events Logged</h3>
            <p className="text-xs text-charcoal-muted max-w-sm mx-auto">
              Administrative actions, stock adjustments, order transitions, and setting modifications will be securely recorded in this immutable audit ledger.
            </p>
          </div>
        ) : (
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-sand text-charcoal-muted uppercase tracking-wider text-[10px] bg-cream/40">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Target Entity</th>
                <th className="py-3 px-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand/40">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-cream/40 transition-colors">
                  <td className="py-3 px-3 text-charcoal-muted whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </td>
                  <td className="py-3 px-3 font-semibold font-mono text-charcoal text-[11px]">
                    {log.action}
                  </td>
                  <td className="py-3 px-3 text-charcoal">
                    {log.entity_type} &middot; {log.entity_id || '—'}
                  </td>
                  <td className="py-3 px-3 font-mono text-charcoal-muted text-[11px]">
                    {log.ip_address || '—'}
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
