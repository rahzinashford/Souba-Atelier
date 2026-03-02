import React, { useState, useEffect, useCallback, useRef } from 'react';
import { adminAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import PrimaryButton from '@/components/common/PrimaryButton';
import SecondaryButton from '@/components/common/SecondaryButton';
import TextInput from '@/components/common/TextInput';
import useSEO from '@/hooks/useSEO';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, AlertTriangle, ClipboardList, Settings,
  DollarSign, TrendingUp, Clock, Edit, Trash2, Plus, Check, X, Loader2, Download, Upload,
  ChevronLeft, ChevronRight, Search, Filter, Eye, ToggleLeft, ToggleRight, Menu, XIcon,
  RefreshCw, MessageSquare, ArrowUpDown, FileText, Database, Calendar, AlertCircle, User,
  LogOut, Home, FileUp, FileDown, History, Shield, Image as ImageIcon, GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'products', label: 'Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingCart },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'inventory', label: 'Inventory', icon: AlertTriangle },
  { id: 'imports', label: 'Import/Export', icon: Database },
  { id: 'logs', label: 'Audit Logs', icon: ClipboardList },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c43', '#a05195'];

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : 'N/A';
const formatDateTime = (d) => d ? new Date(d).toLocaleString() : 'N/A';

const StatCard = ({ title, value, icon: Icon, trend, color = 'brand-primary' }) => (
  <div className="bg-white/80 p-5 rounded-xl border border-brand-primary/10 shadow-sm hover:shadow-md transition-shadow" data-testid={`stat-${title.toLowerCase().replace(/\s+/g, '-')}`}>
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-bold uppercase tracking-wider text-brand-primary/60">{title}</span>
      <div className={cn("p-2 rounded-lg", color === 'red' ? 'bg-red-100' : color === 'green' ? 'bg-green-100' : color === 'amber' ? 'bg-amber-100' : 'bg-brand-primary/10')}>
        <Icon className={cn("w-5 h-5", color === 'red' ? 'text-red-600' : color === 'green' ? 'text-green-600' : color === 'amber' ? 'text-amber-600' : 'text-brand-primary/60')} />
      </div>
    </div>
    <div className="text-2xl font-bold text-brand-primary">{value}</div>
    {trend && <div className="text-xs text-green-600 mt-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {trend}</div>}
  </div>
);

const Pagination = ({ page, totalPages, onPageChange, pageSize, onPageSizeChange }) => (
  <div className="flex items-center justify-between gap-4 mt-4">
    <div className="flex items-center gap-2">
      {onPageSizeChange && (
        <>
          <span className="text-sm text-gray-500">Per page:</span>
          <select 
            value={pageSize} 
            onChange={e => onPageSizeChange(parseInt(e.target.value))} 
            className="border rounded px-2 py-1 text-sm"
            data-testid="select-page-size"
          >
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </>
      )}
    </div>
    <div className="flex items-center gap-2">
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="p-2 rounded border disabled:opacity-40 hover:bg-gray-50" data-testid="button-prev-page">
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-sm px-3">Page {page} of {totalPages || 1}</span>
      <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="p-2 rounded border disabled:opacity-40 hover:bg-gray-50" data-testid="button-next-page">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  if (!open) return null;
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className={cn("bg-white rounded-xl w-full max-h-[90vh] overflow-auto shadow-xl", sizeClasses[size])} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h3 className="font-bold text-lg text-brand-primary">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ open, onClose, onConfirm, title, message, confirmText = 'Confirm', dangerous = false, requireTyping }) => {
  const [typed, setTyped] = useState('');
  
  if (!open) return null;
  
  const canConfirm = !requireTyping || typed === requireTyping;
  
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-4", dangerous ? 'bg-red-100' : 'bg-amber-100')}>
            <AlertCircle className={cn("w-6 h-6", dangerous ? 'text-red-600' : 'text-amber-600')} />
          </div>
          <h3 className="font-bold text-lg text-brand-primary mb-2">{title}</h3>
          <p className="text-gray-600 mb-4">{message}</p>
          
          {requireTyping && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Type <span className="font-mono font-bold text-red-600">{requireTyping}</span> to confirm:</p>
              <input
                type="text"
                value={typed}
                onChange={e => setTyped(e.target.value)}
                className="w-full border rounded px-3 py-2 font-mono"
                placeholder={requireTyping}
                data-testid="input-confirm-typing"
              />
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <SecondaryButton onClick={() => { setTyped(''); onClose(); }}>Cancel</SecondaryButton>
            <button
              onClick={() => { setTyped(''); onConfirm(); }}
              disabled={!canConfirm}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50",
                dangerous ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-brand-primary text-white hover:bg-brand-primary/90'
              )}
              data-testid="button-confirm-action"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const OverviewSection = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { formatPrice, getCurrencySymbol } = useCurrency();

  useEffect(() => {
    adminAPI.getOverview().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;
  if (!data) return <div className="text-center py-10 text-red-500">Failed to load data</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Products" value={data.stats.totalProducts} icon={Package} />
        <StatCard title="Orders (30d)" value={data.stats.totalOrders30d} icon={ShoppingCart} color="green" />
        <StatCard title="Revenue (30d)" value={formatPrice(data.stats.revenue30d)} icon={DollarSign} color="green" />
        <StatCard title="Pending Orders" value={data.stats.pendingOrders} icon={Clock} color="amber" />
        <StatCard title="Low Stock Items" value={data.stats.lowStockCount} icon={AlertTriangle} color="red" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/80 p-5 rounded-xl border border-brand-primary/10">
          <h3 className="font-bold text-brand-primary mb-4">Sales Trend (30 Days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.salesTimeseries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${getCurrencySymbol()}${v}`} />
                <Tooltip formatter={v => formatPrice(v)} />
                <Area type="monotone" dataKey="amount" stroke="#8b5a2b" fill="#d4a574" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 p-5 rounded-xl border border-brand-primary/10">
          <h3 className="font-bold text-brand-primary mb-4">Orders by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.ordersByStatus} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label={({ status, count }) => `${status}: ${count}`}>
                  {data.ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/80 p-5 rounded-xl border border-brand-primary/10">
          <h3 className="font-bold text-brand-primary mb-4">Top Products</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts.slice(0, 5)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="productName" type="category" tick={{ fontSize: 10 }} width={100} />
                <Tooltip formatter={v => `${v} sold`} />
                <Bar dataKey="totalSold" fill="#8b5a2b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/80 p-5 rounded-xl border border-brand-primary/10">
          <h3 className="font-bold text-brand-primary mb-4">Recent Activity</h3>
          <div className="space-y-3 max-h-64 overflow-auto">
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity</p>
            ) : data.recentActivity.map((log, i) => (
              <div key={i} className="flex items-start gap-3 text-sm border-b pb-2">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium text-brand-primary">{log.eventType}</div>
                  <div className="text-xs text-gray-500">{log.actorEmail} · {formatDateTime(log.createdAt)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductsSection = () => {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', code: '', price: '', category: '', stock: '100', imageUrl: '', images: [], variants: [], description: '' });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState(null);
  const [importErrors, setImportErrors] = useState([]);

  const handleVariantImageUpload = async (e, variantIndex, product, setProduct) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const variant = (product.variants || [])[variantIndex];
    const currentImages = variant.images || [];
    if (currentImages.length + files.length > 8) {
      alert('Each color can have a maximum of 8 images.');
      return;
    }

    const formData = new FormData();
    files.forEach(file => formData.append('images', file));

    setUploading(true);
    try {
      const urls = await adminAPI.uploadImages(formData);
      const newVariants = [...(product.variants || [])];
      newVariants[variantIndex] = { ...variant, images: [...currentImages, ...urls] };
      setProduct({ ...product, variants: newVariants });
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeVariantImage = (variantIndex, imageIndex, product, setProduct) => {
    const newVariants = [...(product.variants || [])];
    const newImages = [...(newVariants[variantIndex].images || [])];
    newImages.splice(imageIndex, 1);
    newVariants[variantIndex] = { ...newVariants[variantIndex], images: newImages };
    setProduct({ ...product, variants: newVariants });
  };

  const addColor = (product, setProduct) => {
    if ((product.variants || []).length >= 10) {
      alert('Maximum 10 colors allowed');
      return;
    }
    setProduct({
      ...product,
      variants: [...(product.variants || []), { color: '', hex: '#000000', images: [] }]
    });
  };

  const removeColor = (index, product, setProduct) => {
    const newVariants = [...(product.variants || [])];
    newVariants.splice(index, 1);
    setProduct({ ...product, variants: newVariants });
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const [result, cats] = await Promise.all([
        adminAPI.getProducts({ page, pageSize, search, category, stockStatus }),
        adminAPI.getProductCategories().catch(() => [])
      ]);
      setProducts(result.items || []);
      setTotalPages(result.totalPages || 1);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, category, stockStatus]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); loadProducts(); };
  const toggleSelect = (id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const selectAll = () => setSelectedIds(selectedIds.length === products.length ? [] : products.map(p => p.id));

  const handleBulkAction = async (action, data) => {
    if (selectedIds.length === 0) return;
    try {
      setSaving(true);
      await adminAPI.bulkProductAction(selectedIds, action, data);
      setSelectedIds([]);
      loadProducts();
    } catch (err) {
      alert('Bulk action failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await adminAPI.createProduct({
        ...newProduct,
        price: newProduct.price,
        stock: parseInt(newProduct.stock) || 100,
        imageUrl: newProduct.imageUrl || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
      });
      setNewProduct({ name: '', code: '', price: '', category: '', stock: '100', imageUrl: '', description: '' });
      setIsAdding(false);
      loadProducts();
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      setSaving(true);
      await adminAPI.updateProduct(editingProduct.id, {
        ...editingProduct,
        price: editingProduct.price,
        stock: parseInt(editingProduct.stock) || 0
      });
      setEditingProduct(null);
      loadProducts();
    } catch (err) {
      alert('Update failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await adminAPI.deleteProduct(deleteConfirm.id);
      setDeleteConfirm(null);
      loadProducts();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const requiredHeaders = ['name', 'code', 'price', 'category'];
    const missing = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missing.length > 0) {
      setImportErrors([`Missing required columns: ${missing.join(', ')}`]);
      return [];
    }
    
    const errors = [];
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || '';
      });
      
      if (!row.name) {
        errors.push(`Row ${i + 1}: Missing name`);
        continue;
      }
      if (!row.code) {
        errors.push(`Row ${i + 1}: Missing code`);
        continue;
      }
      if (!row.price || isNaN(parseFloat(row.price))) {
        errors.push(`Row ${i + 1}: Invalid price`);
        continue;
      }
      
      data.push({
        name: row.name,
        code: row.code,
        price: row.price,
        category: row.category || 'Uncategorized',
        stock: parseInt(row.stock) || 100,
        imageUrl: row.imageurl || row.image_url || row.image || '',
        description: row.description || ''
      });
    }
    
    setImportErrors(errors);
    return data;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        const data = parseCSV(text);
        setImportData(data);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importData || importData.length === 0) return;
    try {
      setSaving(true);
      const result = await adminAPI.importProducts(importData);
      alert(`Import complete: ${result.created} created, ${result.updated} updated${result.errors?.length ? `, ${result.errors.length} errors` : ''}`);
      setIsImporting(false);
      setImportData(null);
      setImportErrors([]);
      loadProducts();
    } catch (err) {
      alert('Import failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-brand-primary">Products</h2>
        <div className="flex flex-wrap gap-2">
          <SecondaryButton onClick={() => setIsImporting(true)} className="py-2 px-4 text-sm" data-testid="button-import-products">
            <Upload className="w-4 h-4 mr-1" /> Import CSV
          </SecondaryButton>
          <a href={adminAPI.exportProductsUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-2 text-sm border rounded hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export CSV
          </a>
          <PrimaryButton onClick={() => setIsAdding(true)} className="py-2 px-4 text-sm" data-testid="button-add-product">
            <Plus className="w-4 h-4 mr-1" /> Add Product
          </PrimaryButton>
        </div>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <TextInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="mb-0" data-testid="input-search-products" />
        </div>
        <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }} className="border rounded px-3 py-2 text-sm" data-testid="select-category">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={stockStatus} onChange={e => { setStockStatus(e.target.value); setPage(1); }} className="border rounded px-3 py-2 text-sm" data-testid="select-stock-status">
          <option value="">All Stock</option>
          <option value="low">Low Stock (1-10)</option>
          <option value="out">Out of Stock</option>
        </select>
        <SecondaryButton type="submit" className="py-2 px-4"><Search className="w-4 h-4" /></SecondaryButton>
      </form>

      {selectedIds.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-brand-primary/5 rounded">
          <span className="text-sm font-medium">{selectedIds.length} selected</span>
          <SecondaryButton onClick={() => handleBulkAction('activate')} className="py-1 px-3 text-xs">Activate</SecondaryButton>
          <SecondaryButton onClick={() => handleBulkAction('deactivate')} className="py-1 px-3 text-xs">Deactivate</SecondaryButton>
          <SecondaryButton onClick={() => setSelectedIds([])} className="py-1 px-3 text-xs">Clear</SecondaryButton>
        </div>
      )}

      <Modal open={isAdding} onClose={() => setIsAdding(false)} title="Add Product">
        <form onSubmit={handleAddProduct} className="grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <TextInput label="Name" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required data-testid="input-new-name" />
            <TextInput label="Code" value={newProduct.code} onChange={e => setNewProduct({...newProduct, code: e.target.value})} required data-testid="input-new-code" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <TextInput label="Price" type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required data-testid="input-new-price" />
            <TextInput label="Category" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} required data-testid="input-new-category" />
          </div>
            <div className="grid md:grid-cols-2 gap-4">
              <TextInput label="Stock" type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} data-testid="input-new-stock" />
              <TextInput label="Main Image URL (Optional)" value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} data-testid="input-new-image" />
            </div>
            <div className="space-y-6 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-brand-primary">Colors & Images (Max 10 Colors)</label>
                <SecondaryButton type="button" onClick={() => addColor(newProduct, setNewProduct)} className="text-xs py-1 px-2">
                  <Plus className="w-3 h-3 mr-1" /> Add Color
                </SecondaryButton>
              </div>

              <div className="space-y-6">
                {(newProduct.variants || []).map((variant, vIdx) => (
                  <div key={vIdx} className="p-4 bg-gray-50 rounded-lg border space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex-1 min-w-[150px]">
                        <TextInput 
                          label="Color Name" 
                          value={variant.color} 
                          onChange={e => {
                            const newVariants = [...newProduct.variants];
                            newVariants[vIdx].color = e.target.value;
                            setNewProduct({...newProduct, variants: newVariants});
                          }} 
                          placeholder="e.g. Wine Red"
                          className="mb-0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Hex Color</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={variant.hex || '#000000'} 
                            onChange={e => {
                              const newVariants = [...newProduct.variants];
                              newVariants[vIdx].hex = e.target.value;
                              setNewProduct({...newProduct, variants: newVariants});
                            }}
                            className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                          />
                          <input 
                            type="text" 
                            value={variant.hex || '#000000'} 
                            onChange={e => {
                              const newVariants = [...newProduct.variants];
                              newVariants[vIdx].hex = e.target.value;
                              setNewProduct({...newProduct, variants: newVariants});
                            }}
                            className="w-24 border rounded px-2 py-2 text-sm font-mono"
                          />
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeColor(vIdx, newProduct, setNewProduct)}
                        className="mt-5 p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Images for {variant.color || 'this color'} (1-8)</label>
                        <span className="text-[10px] text-gray-400">{(variant.images || []).length} / 8</span>
                      </div>
                      
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {(variant.images || []).map((img, iIdx) => (
                          <div key={iIdx} className="relative group aspect-square rounded border bg-white overflow-hidden">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => removeVariantImage(vIdx, iIdx, newProduct, setNewProduct)}
                              className="absolute top-0.5 right-0.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {(variant.images || []).length < 8 && (
                          <label className="aspect-square border border-dashed rounded flex flex-col items-center justify-center gap-1 hover:bg-white cursor-pointer transition-colors text-gray-400 hover:text-brand-primary">
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                            <input 
                              type="file" 
                              accept="image/*" 
                              multiple 
                              className="hidden" 
                              onChange={(e) => handleVariantImageUpload(e, vIdx, newProduct, setNewProduct)}
                              disabled={uploading}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {(newProduct.variants || []).length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg bg-gray-50 text-gray-400 italic">
                    No colors defined. Click "Add Color" to start adding variants with their own image sets.
                  </div>
                )}
              </div>
            </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newProduct.description}
              onChange={e => setNewProduct({...newProduct, description: e.target.value})}
              className="w-full border rounded px-3 py-2 min-h-[100px]"
              data-testid="input-new-description"
            />
          </div>
          <div className="flex justify-end gap-2">
            <SecondaryButton type="button" onClick={() => setIsAdding(false)}>Cancel</SecondaryButton>
            <PrimaryButton type="submit" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Product'}</PrimaryButton>
          </div>
        </form>
      </Modal>

      <Modal open={!!editingProduct} onClose={() => setEditingProduct(null)} title="Edit Product">
        {editingProduct && (
          <form onSubmit={handleEditProduct} className="grid gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <TextInput label="Name" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} required />
              <TextInput label="Code" value={editingProduct.code} onChange={e => setEditingProduct({...editingProduct, code: e.target.value})} required />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <TextInput label="Price" type="number" step="0.01" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} required />
              <TextInput label="Category" value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} required />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <TextInput label="Stock" type="number" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: e.target.value})} />
              <TextInput label="Main Image URL" value={editingProduct.imageUrl || ''} onChange={e => setEditingProduct({...editingProduct, imageUrl: e.target.value})} />
            </div>

            <div className="space-y-6 border-t pt-4">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-bold text-brand-primary">Colors & Images (Max 10 Colors)</label>
                <SecondaryButton type="button" onClick={() => addColor(editingProduct, setEditingProduct)} className="text-xs py-1 px-2">
                  <Plus className="w-3 h-3 mr-1" /> Add Color
                </SecondaryButton>
              </div>

              <div className="space-y-6">
                {(editingProduct.variants || []).map((variant, vIdx) => (
                  <div key={vIdx} className="p-4 bg-gray-50 rounded-lg border space-y-4">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex-1 min-w-[150px]">
                        <TextInput 
                          label="Color Name" 
                          value={variant.color} 
                          onChange={e => {
                            const newVariants = [...editingProduct.variants];
                            newVariants[vIdx].color = e.target.value;
                            setEditingProduct({...editingProduct, variants: newVariants});
                          }} 
                          placeholder="e.g. Wine Red"
                          className="mb-0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Hex Color</label>
                        <div className="flex items-center gap-2">
                          <input 
                            type="color" 
                            value={variant.hex || '#000000'} 
                            onChange={e => {
                              const newVariants = [...editingProduct.variants];
                              newVariants[vIdx].hex = e.target.value;
                              setEditingProduct({...editingProduct, variants: newVariants});
                            }}
                            className="w-10 h-10 p-0 border-0 rounded cursor-pointer"
                          />
                          <input 
                            type="text" 
                            value={variant.hex || '#000000'} 
                            onChange={e => {
                              const newVariants = [...editingProduct.variants];
                              newVariants[vIdx].hex = e.target.value;
                              setEditingProduct({...editingProduct, variants: newVariants});
                            }}
                            className="w-24 border rounded px-2 py-2 text-sm font-mono"
                          />
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeColor(vIdx, editingProduct, setEditingProduct)}
                        className="mt-5 p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Images for {variant.color || 'this color'} (1-8)</label>
                        <span className="text-[10px] text-gray-400">{(variant.images || []).length} / 8</span>
                      </div>
                      
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {(variant.images || []).map((img, iIdx) => (
                          <div key={iIdx} className="relative group aspect-square rounded border bg-white overflow-hidden">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => removeVariantImage(vIdx, iIdx, editingProduct, setEditingProduct)}
                              className="absolute top-0.5 right-0.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {(variant.images || []).length < 8 && (
                          <label className="aspect-square border border-dashed rounded flex flex-col items-center justify-center gap-1 hover:bg-white cursor-pointer transition-colors text-gray-400 hover:text-brand-primary">
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                            <input 
                              type="file" 
                              accept="image/*" 
                              multiple 
                              className="hidden" 
                              onChange={(e) => handleVariantImageUpload(e, vIdx, editingProduct, setEditingProduct)}
                              disabled={uploading}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {(editingProduct.variants || []).length === 0 && (
                  <div className="text-center py-10 border-2 border-dashed rounded-lg bg-gray-50 text-gray-400 italic">
                    No colors defined. Click "Add Color" to start adding variants with their own image sets.
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={editingProduct.description || ''}
                onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                className="w-full border rounded px-3 py-2 min-h-[100px]"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingProduct.active !== false}
                  onChange={e => setEditingProduct({...editingProduct, active: e.target.checked})}
                />
                <span className="text-sm">Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <SecondaryButton type="button" onClick={() => setEditingProduct(null)}>Cancel</SecondaryButton>
              <PrimaryButton type="submit" disabled={saving}>{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}</PrimaryButton>
            </div>
          </form>
        )}
      </Modal>

      <Modal open={isImporting} onClose={() => { setIsImporting(false); setImportData(null); setImportErrors([]); }} title="Import Products from CSV" size="lg">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">CSV Format</h4>
            <p className="text-sm text-gray-600 mb-2">Required columns: <span className="font-mono">name, code, price, category</span></p>
            <p className="text-sm text-gray-600">Optional columns: <span className="font-mono">stock, imageUrl, description</span></p>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Upload CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-brand-primary file:text-white hover:file:bg-brand-primary/90"
              data-testid="input-csv-file"
            />
          </div>
          
          {importErrors.length > 0 && (
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-medium text-red-700 mb-2">Validation Errors</h4>
              <ul className="list-disc list-inside text-sm text-red-600">
                {importErrors.slice(0, 10).map((err, i) => <li key={i}>{err}</li>)}
                {importErrors.length > 10 && <li>...and {importErrors.length - 10} more errors</li>}
              </ul>
            </div>
          )}
          
          {importData && importData.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Preview ({importData.length} products)</h4>
              <div className="max-h-60 overflow-auto border rounded">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Name</th>
                      <th className="p-2 text-left">Code</th>
                      <th className="p-2 text-left">Price</th>
                      <th className="p-2 text-left">Category</th>
                      <th className="p-2 text-left">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importData.slice(0, 20).map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">{row.name}</td>
                        <td className="p-2 font-mono text-xs">{row.code}</td>
                        <td className="p-2">{formatPrice(row.price)}</td>
                        <td className="p-2">{row.category}</td>
                        <td className="p-2">{row.stock}</td>
                      </tr>
                    ))}
                    {importData.length > 20 && (
                      <tr className="border-t">
                        <td colSpan="5" className="p-2 text-center text-gray-500">...and {importData.length - 20} more rows</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <SecondaryButton onClick={() => { setIsImporting(false); setImportData(null); setImportErrors([]); }}>Cancel</SecondaryButton>
            <PrimaryButton onClick={handleImport} disabled={saving || !importData || importData.length === 0}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Upload className="w-4 h-4 mr-1" />}
              Import {importData?.length || 0} Products
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        dangerous
        requireTyping="DELETE"
      />

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-primary/5 text-left">
                <th className="p-3"><input type="checkbox" checked={selectedIds.length === products.length && products.length > 0} onChange={selectAll} /></th>
                <th className="p-3">Product</th>
                <th className="p-3">Code</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-8 text-gray-500">No products found</td></tr>
              ) : products.map(p => (
                <tr key={p.id} className="border-b hover:bg-gray-50" data-testid={`row-product-${p.id}`}>
                  <td className="p-3"><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={() => toggleSelect(p.id)} /></td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <img src={p.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-xs">{p.code}</td>
                  <td className="p-3">{p.category}</td>
                  <td className="p-3">{formatPrice(p.price)}</td>
                  <td className="p-3"><span className={p.stock <= 10 ? 'text-red-600 font-bold' : p.stock === 0 ? 'text-red-700 font-bold' : ''}>{p.stock}</span></td>
                  <td className="p-3"><span className={cn('px-2 py-1 rounded text-xs font-bold', p.active !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>{p.active !== false ? 'Active' : 'Inactive'}</span></td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setEditingProduct({...p})} className="p-1 hover:bg-gray-100 rounded" data-testid={`button-edit-${p.id}`}><Edit className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteConfirm(p)} className="p-1 hover:bg-red-50 text-red-500 rounded" data-testid={`button-delete-${p.id}`}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={setPageSize} />
    </div>
  );
};

const OrdersSection = () => {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderNotes, setOrderNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminAPI.getOrders({ page, pageSize, status, search, dateFrom, dateTo });
      setOrders(result.items || []);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, search, dateFrom, dateTo]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const openOrderDetails = async (order) => {
    setSelectedOrder(order);
    try {
      const [details, notes] = await Promise.all([
        adminAPI.getOrderById(order.id),
        adminAPI.getOrderNotes(order.id).catch(() => [])
      ]);
      setSelectedOrder(details);
      setOrderNotes(notes);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      setSaving(true);
      await adminAPI.updateOrderStatus(id, newStatus);
      loadOrders();
      if (selectedOrder?.id === id) setSelectedOrder({...selectedOrder, status: newStatus});
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addNote = async () => {
    if (!newNote.trim() || !selectedOrder) return;
    try {
      setSaving(true);
      await adminAPI.addOrderNote(selectedOrder.id, newNote);
      const notes = await adminAPI.getOrderNotes(selectedOrder.id);
      setOrderNotes(notes);
      setNewNote('');
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (s) => {
    const colors = { PENDING: 'bg-amber-100 text-amber-700', PAID: 'bg-blue-100 text-blue-700', SHIPPED: 'bg-purple-100 text-purple-700', DELIVERED: 'bg-green-100 text-green-700', CANCELLED: 'bg-red-100 text-red-700' };
    return colors[s] || 'bg-gray-100 text-gray-700';
  };

  const clearFilters = () => {
    setSearch('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-brand-primary">Orders</h2>
        <div className="flex gap-2">
          <a href={adminAPI.exportOrdersUrl()} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-3 py-2 text-sm border rounded hover:bg-gray-50">
            <Download className="w-4 h-4" /> Export CSV
          </a>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-end bg-white p-4 rounded-lg border">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <TextInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Order ID, email, name..." className="mb-0" data-testid="input-search-orders" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="border rounded px-3 py-2 text-sm" data-testid="select-order-status">
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-3 py-2 text-sm" data-testid="input-date-from" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-3 py-2 text-sm" data-testid="input-date-to" />
        </div>
        <SecondaryButton onClick={clearFilters} className="py-2 px-3"><X className="w-4 h-4" /></SecondaryButton>
        <SecondaryButton onClick={() => { setPage(1); loadOrders(); }} className="py-2 px-4"><Search className="w-4 h-4" /></SecondaryButton>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-primary/5 text-left">
                <th className="p-3">Order ID</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Date</th>
                <th className="p-3">Total</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No orders found</td></tr>
              ) : orders.map(o => (
                <tr key={o.id} className="border-b hover:bg-gray-50" data-testid={`row-order-${o.id}`}>
                  <td className="p-3 font-mono text-xs">{o.id.slice(0, 8)}...</td>
                  <td className="p-3">
                    <div>{o.user?.name || o.shippingName || 'Guest'}</div>
                    <div className="text-xs text-gray-500">{o.user?.email || ''}</div>
                  </td>
                  <td className="p-3">{formatDate(o.createdAt)}</td>
                  <td className="p-3 font-bold">{formatPrice(o.totalAmount)}</td>
                  <td className="p-3">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} disabled={saving} className={cn('text-xs font-bold px-2 py-1 rounded border-0 cursor-pointer', getStatusColor(o.status))} data-testid={`select-status-${o.id}`}>
                      <option value="PENDING">Pending</option>
                      <option value="PAID">Paid</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => openOrderDetails(o)} className="p-1 hover:bg-gray-100 rounded" data-testid={`button-view-${o.id}`}><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={setPageSize} />

      <Modal open={!!selectedOrder} onClose={() => setSelectedOrder(null)} title={`Order ${selectedOrder?.id?.slice(0, 8)}...`} size="lg">
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-sm text-gray-600 mb-3 flex items-center gap-2"><User className="w-4 h-4" /> Customer</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Name:</span> {selectedOrder.user?.name || selectedOrder.shippingName}</div>
                    <div><span className="font-medium">Email:</span> {selectedOrder.user?.email || 'Guest'}</div>
                    <div><span className="font-medium">Phone:</span> {selectedOrder.shippingPhone || 'N/A'}</div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-sm text-gray-600 mb-3 flex items-center gap-2"><Package className="w-4 h-4" /> Shipping</h4>
                  <div className="text-sm">
                    {selectedOrder.shippingAddress}, {selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingPinCode}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-sm text-gray-600 mb-3 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Payment</h4>
                  <div className="space-y-1 text-sm">
                    <div><span className="font-medium">Total:</span> <span className="text-lg font-bold">{formatPrice(selectedOrder.totalAmount)}</span></div>
                    <div><span className="font-medium">Method:</span> {selectedOrder.paymentMethod || 'COD'}</div>
                    <div><span className="font-medium">Status:</span> <span className={cn('px-2 py-0.5 rounded text-xs font-bold', getStatusColor(selectedOrder.status))}>{selectedOrder.status}</span></div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-bold text-sm text-gray-600 mb-3 flex items-center gap-2"><History className="w-4 h-4" /> Timeline</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Created on {formatDateTime(selectedOrder.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedOrder.items && (
              <div>
                <h4 className="font-bold mb-3">Items ({selectedOrder.items.length})</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center text-sm bg-gray-50 p-3 rounded">
                      <div className="flex items-center gap-3">
                        <img src={item.product?.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                        <div>
                          <div className="font-medium">{item.productName || item.product?.name}</div>
                          <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                        </div>
                      </div>
                      <span className="font-bold">{formatPrice((item.price || item.priceAtPurchase) * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="font-bold mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Internal Notes</h4>
              <div className="space-y-2 max-h-40 overflow-auto mb-3">
                {orderNotes.length === 0 ? (
                  <p className="text-sm text-gray-500">No notes yet</p>
                ) : orderNotes.map((n, i) => (
                  <div key={i} className="text-sm bg-gray-50 p-3 rounded">
                    <div>{n.note}</div>
                    <div className="text-xs text-gray-500 mt-1">{n.adminName} · {formatDateTime(n.createdAt)}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <TextInput value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add an internal note..." className="flex-1 mb-0" />
                <PrimaryButton onClick={addNote} disabled={saving || !newNote.trim()} className="py-2 px-4">Add Note</PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

const UsersSection = () => {
  const { formatPrice } = useCurrency();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [roleChangeConfirm, setRoleChangeConfirm] = useState(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminAPI.getUsers({ page, pageSize, search, role: roleFilter });
      setUsers(result.items || []);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, roleFilter]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const openUserProfile = async (user) => {
    setSelectedUser(user);
    try {
      const details = await adminAPI.getUserById(user.id);
      setUserDetails(details);
    } catch (err) {
      console.error(err);
    }
  };

  const updateRole = async () => {
    if (!roleChangeConfirm) return;
    try {
      setSaving(true);
      await adminAPI.updateUserRole(roleChangeConfirm.id, roleChangeConfirm.newRole);
      setRoleChangeConfirm(null);
      loadUsers();
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id, currentActive) => {
    try {
      setSaving(true);
      await adminAPI.updateUserActive(id, !currentActive);
      loadUsers();
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const revokeSessions = async (id) => {
    if (!confirm('Revoke all sessions for this user?')) return;
    try {
      await adminAPI.revokeUserSessions(id);
      alert('Sessions revoked');
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-brand-primary">Users</h2>

      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <TextInput value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="mb-0" onKeyDown={e => e.key === 'Enter' && loadUsers()} data-testid="input-search-users" />
        </div>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="border rounded px-3 py-2 text-sm" data-testid="select-role-filter">
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        <SecondaryButton onClick={loadUsers} className="py-2 px-4"><RefreshCw className="w-4 h-4" /></SecondaryButton>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-primary/5 text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Last Login</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-gray-500">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="border-b hover:bg-gray-50" data-testid={`row-user-${u.id}`}>
                  <td className="p-3 font-medium">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setRoleChangeConfirm({ ...u, newRole: u.role === 'ADMIN' ? 'USER' : 'ADMIN' })}
                      className={cn('px-2 py-1 rounded text-xs font-bold', u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700')}
                      data-testid={`button-role-${u.id}`}
                    >
                      {u.role}
                    </button>
                  </td>
                  <td className="p-3">
                    <span className={cn('px-2 py-1 rounded text-xs font-bold', u.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                      {u.active !== false ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="p-3 text-xs">{u.lastLogin ? formatDateTime(u.lastLogin) : 'Never'}</td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => openUserProfile(u)} className="p-1 hover:bg-gray-100 rounded" title="View Profile" data-testid={`button-profile-${u.id}`}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleActive(u.id, u.active !== false)} disabled={saving} className="p-1 hover:bg-gray-100 rounded" title={u.active !== false ? 'Disable' : 'Enable'} data-testid={`button-toggle-${u.id}`}>
                        {u.active !== false ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-400" />}
                      </button>
                      <button onClick={() => revokeSessions(u.id)} className="p-1 hover:bg-gray-100 rounded text-orange-500" title="Revoke Sessions" data-testid={`button-revoke-${u.id}`}>
                        <LogOut className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={setPageSize} />

      <ConfirmDialog
        open={!!roleChangeConfirm}
        onClose={() => setRoleChangeConfirm(null)}
        onConfirm={updateRole}
        title="Change User Role"
        message={`Are you sure you want to change ${roleChangeConfirm?.name}'s role to ${roleChangeConfirm?.newRole}?${roleChangeConfirm?.newRole === 'ADMIN' ? ' This will give them full admin access.' : ''}`}
        confirmText="Change Role"
        dangerous={roleChangeConfirm?.newRole === 'ADMIN'}
      />

      <Modal open={!!selectedUser} onClose={() => { setSelectedUser(null); setUserDetails(null); }} title="User Profile" size="md">
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-brand-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedUser.name}</h3>
                <p className="text-gray-600">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <span className={cn('px-2 py-0.5 rounded text-xs font-bold', selectedUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700')}>
                    {selectedUser.role}
                  </span>
                  <span className={cn('px-2 py-0.5 rounded text-xs font-bold', selectedUser.active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                    {selectedUser.active !== false ? 'Active' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500 mb-1">Created</div>
                <div className="font-medium">{formatDateTime(selectedUser.createdAt)}</div>
              </div>
              <div className="p-3 bg-gray-50 rounded">
                <div className="text-xs text-gray-500 mb-1">Last Login</div>
                <div className="font-medium">{selectedUser.lastLogin ? formatDateTime(selectedUser.lastLogin) : 'Never'}</div>
              </div>
            </div>

            {userDetails?.ordersSummary && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-bold text-sm mb-3">Orders Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs text-gray-500">Total Orders</div>
                    <div className="font-bold text-lg">{userDetails.ordersSummary.totalOrders || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Total Spent</div>
                    <div className="font-bold text-lg">{formatPrice(userDetails.ordersSummary.totalSpent || 0)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

const InventorySection = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(10);
  const [adjusting, setAdjusting] = useState(null);
  const [adjustment, setAdjustment] = useState('');

  const loadLowStock = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminAPI.getLowStock(threshold);
      setProducts(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [threshold]);

  useEffect(() => { loadLowStock(); }, [loadLowStock]);

  const handleAdjust = async (id) => {
    const adj = parseInt(adjustment);
    if (isNaN(adj)) return;
    try {
      await adminAPI.adjustStock(id, adj);
      setAdjusting(null);
      setAdjustment('');
      loadLowStock();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-brand-primary">Inventory Alerts</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm">Threshold:</label>
          <input type="number" value={threshold} onChange={e => setThreshold(parseInt(e.target.value) || 10)} className="border rounded px-2 py-1 w-16 text-sm" />
          <SecondaryButton onClick={loadLowStock} className="py-1 px-3"><RefreshCw className="w-4 h-4" /></SecondaryButton>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-10 bg-green-50 rounded-lg">
          <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <div className="text-green-700 font-medium">All products are well-stocked!</div>
          <div className="text-green-600 text-sm">No items below threshold of {threshold}</div>
        </div>
      ) : (
        <div className="grid gap-3">
          {products.map(p => (
            <div key={p.id} className={cn("flex items-center justify-between bg-white border rounded-lg p-4", p.stock === 0 && "border-red-300 bg-red-50")} data-testid={`inventory-${p.id}`}>
              <div className="flex items-center gap-3">
                <img src={p.imageUrl} alt="" className="w-12 h-12 rounded object-cover" />
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.code}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={cn('text-lg font-bold', p.stock === 0 ? 'text-red-600' : 'text-amber-600')}>
                  {p.stock === 0 ? 'OUT OF STOCK' : `${p.stock} left`}
                </div>
                {adjusting === p.id ? (
                  <div className="flex items-center gap-2">
                    <input type="number" value={adjustment} onChange={e => setAdjustment(e.target.value)} placeholder="+/-" className="border rounded px-2 py-1 w-20 text-sm" data-testid={`input-adjust-${p.id}`} />
                    <button onClick={() => handleAdjust(p.id)} className="p-1 bg-green-600 text-white rounded"><Check className="w-4 h-4" /></button>
                    <button onClick={() => { setAdjusting(null); setAdjustment(''); }} className="p-1 bg-gray-500 text-white rounded"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <SecondaryButton onClick={() => setAdjusting(p.id)} className="py-1 px-3 text-sm" data-testid={`button-adjust-${p.id}`}>
                    <ArrowUpDown className="w-4 h-4 mr-1" /> Adjust
                  </SecondaryButton>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ImportExportSection = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-brand-primary">Import / Export Hub</h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold">Import Data</h3>
              <p className="text-sm text-gray-500">Upload CSV files to import data</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="font-medium">Products</div>
              <div className="text-xs text-gray-500">Import products from CSV with name, code, price, category</div>
            </div>
            <p className="text-xs text-gray-400">Go to Products tab to use the Import CSV feature</p>
          </div>
        </div>
        
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileDown className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold">Export Data</h3>
              <p className="text-sm text-gray-500">Download data as CSV files</p>
            </div>
          </div>
          <div className="space-y-3">
            <a href={adminAPI.exportProductsUrl()} target="_blank" rel="noopener noreferrer" className="block p-3 border rounded-lg hover:bg-gray-50">
              <div className="font-medium flex items-center gap-2">
                <Package className="w-4 h-4" /> Products
              </div>
              <div className="text-xs text-gray-500">Export all products with full details</div>
            </a>
            <a href={adminAPI.exportOrdersUrl()} target="_blank" rel="noopener noreferrer" className="block p-3 border rounded-lg hover:bg-gray-50">
              <div className="font-medium flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" /> Orders
              </div>
              <div className="text-xs text-gray-500">Export all orders with customer info</div>
            </a>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 border rounded-xl p-6">
        <h3 className="font-bold mb-3">CSV Format Guide</h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium mb-2">Products CSV</h4>
            <div className="bg-white p-3 rounded font-mono text-xs">
              name,code,price,category,stock,imageUrl<br/>
              "Product Name",SKU001,29.99,Category,100,https://...
            </div>
          </div>
          <div>
            <h4 className="font-medium mb-2">Required Columns</h4>
            <ul className="list-disc list-inside text-gray-600">
              <li>name - Product name</li>
              <li>code - Unique SKU/code</li>
              <li>price - Price in decimal</li>
              <li>category - Category name</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const AuditLogsSection = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(30);
  const [totalPages, setTotalPages] = useState(1);
  const [eventType, setEventType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminAPI.getAuditLogs({ page, pageSize, eventType, dateFrom, dateTo });
      setLogs(result.items || []);
      setTotalPages(result.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, eventType, dateFrom, dateTo]);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const getEventIcon = (type) => {
    if (type?.includes('USER')) return <User className="w-4 h-4" />;
    if (type?.includes('ORDER')) return <ShoppingCart className="w-4 h-4" />;
    if (type?.includes('PRODUCT') || type?.includes('STOCK')) return <Package className="w-4 h-4" />;
    if (type?.includes('SETTING')) return <Settings className="w-4 h-4" />;
    return <ClipboardList className="w-4 h-4" />;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-brand-primary">Audit Logs</h2>
      </div>

      <div className="flex flex-wrap gap-3 items-end bg-white p-4 rounded-lg border">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Event Type</label>
          <select value={eventType} onChange={e => { setEventType(e.target.value); setPage(1); }} className="border rounded px-3 py-2 text-sm" data-testid="select-event-type">
            <option value="">All Events</option>
            <option value="USER_ROLE_CHANGE">User Role Change</option>
            <option value="USER_ENABLED">User Enabled</option>
            <option value="USER_DISABLED">User Disabled</option>
            <option value="ORDER_STATUS_CHANGE">Order Status Change</option>
            <option value="STOCK_ADJUSTED">Stock Adjusted</option>
            <option value="PRODUCTS_IMPORT">Products Import</option>
            <option value="SETTING_CHANGED">Setting Changed</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="border rounded px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="border rounded px-3 py-2 text-sm" />
        </div>
        <SecondaryButton onClick={() => { setEventType(''); setDateFrom(''); setDateTo(''); setPage(1); }} className="py-2 px-3"><X className="w-4 h-4" /></SecondaryButton>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>
      ) : logs.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No audit logs found</div>
      ) : (
        <div className="space-y-2">
          {logs.map((log, i) => (
            <div key={i} className="bg-white border rounded-lg p-4 flex items-start gap-3" data-testid={`log-${i}`}>
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0">
                {getEventIcon(log.eventType)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-brand-primary">{log.eventType}</span>
                  {log.targetType && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{log.targetType}</span>}
                </div>
                <div className="text-sm text-gray-600 mt-1">{log.actorEmail || 'System'}</div>
                {log.details && (
                  <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded font-mono overflow-auto max-w-full">
                    {log.details}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(log.createdAt)}</div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} pageSize={pageSize} onPageSizeChange={setPageSize} />
    </div>
  );
};

const SettingsSection = () => {
  const { getCurrencySymbol } = useCurrency();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState(null);

  useEffect(() => {
    adminAPI.getSettings().then(setSettings).catch(console.error).finally(() => setLoading(false));
  }, []);

  const updateSetting = async (key, value) => {
    try {
      setSaving(true);
      await adminAPI.updateSetting(key, value);
      setSettings({...settings, [key]: value});
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 2000);
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-primary" /></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-brand-primary">Settings</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-bold">Free Shipping Threshold</h3>
              <p className="text-xs text-gray-500">Orders above this amount get free shipping</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">{getCurrencySymbol()}</span>
            <input 
              type="number" 
              value={settings.freeShippingThreshold || ''} 
              onChange={e => setSettings({...settings, freeShippingThreshold: e.target.value})}
              className="border rounded px-3 py-2 flex-1"
              data-testid="input-free-shipping"
            />
            <PrimaryButton onClick={() => updateSetting('freeShippingThreshold', settings.freeShippingThreshold)} disabled={saving} className="py-2 px-4">
              {savedKey === 'freeShippingThreshold' ? <Check className="w-4 h-4" /> : 'Save'}
            </PrimaryButton>
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold">Low Stock Threshold</h3>
              <p className="text-xs text-gray-500">Products below this stock level trigger alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              value={settings.lowStockThreshold || ''} 
              onChange={e => setSettings({...settings, lowStockThreshold: e.target.value})}
              className="border rounded px-3 py-2 flex-1"
              data-testid="input-low-stock-threshold"
            />
            <PrimaryButton onClick={() => updateSetting('lowStockThreshold', settings.lowStockThreshold)} disabled={saving} className="py-2 px-4">
              {savedKey === 'lowStockThreshold' ? <Check className="w-4 h-4" /> : 'Save'}
            </PrimaryButton>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", settings.maintenanceMode === 'true' ? 'bg-red-100' : 'bg-gray-100')}>
              <Shield className={cn("w-5 h-5", settings.maintenanceMode === 'true' ? 'text-red-600' : 'text-gray-500')} />
            </div>
            <div>
              <h3 className="font-bold">Maintenance Mode</h3>
              <p className="text-xs text-gray-500">When enabled, the store is not accessible to customers</p>
            </div>
          </div>
          <button 
            onClick={() => updateSetting('maintenanceMode', settings.maintenanceMode === 'true' ? 'false' : 'true')}
            disabled={saving}
            className="p-2"
            data-testid="button-maintenance-toggle"
          >
            {settings.maintenanceMode === 'true' ? (
              <ToggleRight className="w-12 h-12 text-red-600" />
            ) : (
              <ToggleLeft className="w-12 h-12 text-gray-400" />
            )}
          </button>
        </div>
        {settings.maintenanceMode === 'true' && (
          <div className="mt-4 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 inline mr-2" />
            Maintenance mode is ON. Customers cannot access the store.
          </div>
        )}
      </div>
    </div>
  );
};

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  
  useSEO({
    title: 'Admin Dashboard',
    description: 'Manage your Souba Atelier store. View analytics, manage products, orders, users, and settings.'
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewSection />;
      case 'products': return <ProductsSection />;
      case 'orders': return <OrdersSection />;
      case 'users': return <UsersSection />;
      case 'inventory': return <InventorySection />;
      case 'imports': return <ImportExportSection />;
      case 'logs': return <AuditLogsSection />;
      case 'settings': return <SettingsSection />;
      default: return <OverviewSection />;
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        data-testid="button-toggle-sidebar"
      >
        {sidebarOpen ? <XIcon className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-brand-primary text-white transform transition-transform duration-300 ease-in-out flex flex-col",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-serif font-bold" data-testid="text-admin-title">Admin Console</h1>
          <p className="text-sm text-white/60 mt-1">Souba Atelier</p>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-auto">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
              data-testid={`nav-${tab.id}`}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors",
                activeTab === tab.id ? "bg-white/20 text-white font-bold" : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name || 'Admin'}</div>
              <div className="text-xs text-white/60 truncate">{user?.email}</div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <a href="/" className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <Home className="w-3 h-3" /> Store
            </a>
            <button onClick={logout} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <main className="flex-1 min-w-0">
        <header className="bg-white border-b px-4 lg:px-8 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-4 ml-12 lg:ml-0">
              <h2 className="text-lg font-bold text-brand-primary capitalize">{TABS.find(t => t.id === activeTab)?.label || 'Overview'}</h2>
            </div>
            <div className="hidden md:flex items-center gap-2">
              {['overview', 'products', 'orders', 'users'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-lg transition-colors",
                    activeTab === tab ? "bg-brand-primary text-white" : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </header>
        
        <div className="p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
