import { resolve } from 'aurelia';
import { DialogService } from '@aurelia/dialog';
import { UsersService, type UserSummary } from '../../api/users.service';
import { UserDialog } from '../../components/user-dialog';

export class Users {
  private svc = new UsersService();
  private dialog = resolve(DialogService);

  items: UserSummary[] = [];
  total = 0;
  page = 1;
  pageSize = 10;
  search = '';
  isLoading = false;   // 👈 renomeado
  error = '';

  sortColumn: keyof UserSummary | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  async attaching() {
    await this.load();
  }

  private parseProblem(e: any) {
    try { const p = JSON.parse(e.message); return p.title || 'Falha na operação'; }
    catch { return e.message || 'Falha na operação'; }
  }

  async load() {
    this.isLoading = true;   // 👈
    this.error = '';
    try {
      const r = await this.svc.list(this.page, this.pageSize, this.search || undefined);
      this.items = r.items;
      this.total = r.total;

      if (this.sortColumn) {
        const m = this.sortDirection === 'asc' ? 1 : -1;
        const col = this.sortColumn;
        this.items = [...this.items].sort((a: any, b: any) =>
          a[col] < b[col] ? -m : a[col] > b[col] ? m : 0
        );
      }
    } catch (e: any) {
      this.error = this.parseProblem(e);
    } finally {
      this.isLoading = false;  // 👈
    }
  }

  async doSearch() { this.page = 1; await this.load(); }
  async nextPage() { if (this.page * this.pageSize < this.total) { this.page++; await this.load(); } }
  async prevPage() { if (this.page > 1) { this.page--; await this.load(); } }

  sort(col: keyof UserSummary) {
    if (this.sortColumn === col) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = col;
      this.sortDirection = 'asc';
    }
    const m = this.sortDirection === 'asc' ? 1 : -1;
    this.items = [...this.items].sort((a: any, b: any) =>
      a[col] < b[col] ? -m : a[col] > b[col] ? m : 0
    );
  }

  private async openAndGet(model: any) {
    const opened = await this.dialog.open({ component: UserDialog, model, options: { modal: true } });
    const result: any =
      opened && typeof (opened as any).whenClosed === 'function'
        ? await (opened as any).whenClosed()
        : opened;
    const cancelled = result?.wasCancelled ?? result?.cancelled ?? false;
    const value = result?.value ?? result?.output ?? null;
    return cancelled ? null : value;
  }

  async openCreate() {
    try {
      const payload = await this.openAndGet({ mode: 'create' });
      if (payload) { await this.svc.create(payload); await this.load(); }
    } catch (e: any) { this.error = this.parseProblem(e); }
  }

  async openEdit(u: UserSummary) {
    try {
      const payload = await this.openAndGet({ mode: 'edit', user: u });
      if (payload) { await this.svc.update(u.id, { ...payload, rowVersion: u.rowVersion }); await this.load(); }
    } catch (e: any) { this.error = this.parseProblem(e); }
  }

  async remove(u: UserSummary) {
    try { await this.svc.softDelete(u.id); await this.load(); }
    catch (e: any) { this.error = this.parseProblem(e); }
  }

  async toggle(u: UserSummary) {
    try {
      if (u.ativo) await this.svc.softDelete(u.id);
      else await this.svc.restore(u.id);
      await this.load();
    } catch (e: any) { this.error = this.parseProblem(e); }
  }
}
