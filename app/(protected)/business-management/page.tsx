import { PageHeader } from '@/components/admin/common/page-header';
import { PageShell } from '@/components/admin/common/page-shell';

export default function BusinessManagementPage() {
  return (
    <PageShell>
      <PageHeader title="Business Management" crumbs={[{ label: 'Business Management' }]} />
    </PageShell>
  );
}
