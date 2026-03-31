import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Users } from 'lucide-react';

import AdminLayout from '@/components/admin/AdminLayout';
import { useAuth } from '@/contexts/AuthContext';
import { adminService, CustomerResponse } from '@/services/adminService';
import { Input } from '@/components/ui/input';
import EmptyState from '@/components/ui/EmptyState';

const AdminCustomers: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  /* ================= AUTH GUARD ================= */
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  /* ================= LOAD CUSTOMERS ================= */
  useEffect(() => {
    adminService.getAllCustomers().then((res) => {
      setCustomers(res.data);
    });
  }, []);

  /* ================= FILTER ================= */
  const filteredCustomers = useMemo(() => {
    return customers.filter(
      (c) =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.mobile?.includes(searchQuery)
    );
  }, [customers, searchQuery]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredCustomers.length / pageSize);

  const paginatedCustomers = useMemo(() => {
    const start = (pageIndex - 1) * pageSize;
    const end = start + pageSize;
    return filteredCustomers.slice(start, end);
  }, [filteredCustomers, pageIndex, pageSize]);

  const totalCustomers = customers.length;

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Registered customers list
          </p>
        </div>

        {/* Total Card */}
        <div className="admin-card p-4 flex items-center gap-3 w-fit">
          <Users className="text-blue-600" />
          <div>
            <p className="text-sm text-muted-foreground">Total Registered</p>
            <p className="text-xl font-semibold">{totalCustomers}</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPageIndex(1);
            }}
            className="pl-10"
          />
        </div>

        {/* Table */}
        <div className="admin-card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">#</th>
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Mobile</th>
                <th className="text-left py-3 px-4">Address</th>
                <th className="text-left py-3 px-4">Join Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Users}
                      title={
                        customers.length === 0
                          ? 'No customers yet'
                          : 'No customers found'
                      }
                      description={
                        customers.length === 0
                          ? 'Customers will appear here once users register.'
                          : 'Try changing search keywords.'
                      }
                    />
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c, i) => (
                  <tr key={c._id} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      {(pageIndex - 1) * pageSize + i + 1}
                    </td>

                    <td className="py-3 px-4 font-medium">
                      {c.name}
                    </td>

                    <td className="py-3 px-4">
                      {c.email}
                    </td>

                    <td className="py-3 px-4">
                      {c.mobile || '-'}
                    </td>

                    <td className="py-3 px-4">
                      {c.address
                        ? `${c.address.addressLine1 || ''}, ${c.address.city || ''}, ${c.address.state || ''}`
                        : '-'}
                    </td>

                    <td className="py-3 px-4">
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <div>
            Rows per page:{' '}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageIndex(1);
              }}
              className="border rounded px-2 py-1"
            >
              {[5, 10, 15, 20].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setPageIndex((p) => Math.max(1, p - 1))}
              disabled={pageIndex === 1}
            >
              Prev
            </button>
            <span>
              {pageIndex} / {totalPages || 1}
            </span>
            <button
              onClick={() =>
                setPageIndex((p) => Math.min(totalPages, p + 1))
              }
              disabled={pageIndex === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminCustomers;