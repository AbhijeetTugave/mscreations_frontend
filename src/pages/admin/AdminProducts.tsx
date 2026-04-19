import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, X, Upload } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
import { Package } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue, } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@/components/ui/dialog';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { adminService, ProductResponse } from '@/services/adminService';
import { API_URL } from "@/lib/config";
type ImageType = {
  url: string;
  public_id: string;
};
/* ================= CONSTANTS ================= */

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const MAX_IMAGES = 4;
/* ================= COMPONENT ================= */

const AdminProducts: React.FC = () => {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  /* ================= LIST ================= */
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  /* ================= MODAL ================= */
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  /* ================= DROPDOWNS ================= */
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [productTypes, setProductTypes] = useState<string[]>([]);

  /* ================= IMAGES ================= */
  // const [images, setImages] = useState<string[]>([]);
  const [images, setImages] = useState<{ url: string; public_id: string }[]>([]);
  // const [preview, setPreview] = useState<string | null>(null);
  

  // loading
  const [loading, setLoading] = useState(false);

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    productName: '',
    description: '',
    category: '',
    subcategory: '',
    productType: '',
    brand: '',
    mrp: '',
    sellingPrice: '',
    discount: '',
    stock: '',
    lowStock: '',
    sizes: [] as string[],
    colors: [] as string[],
  });
  // const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  /* ================= AUTH ================= */
  useEffect(() => {
    if (!isAuthenticated || !isAdmin) navigate('/login');
  }, [isAuthenticated, isAdmin, navigate]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    adminService.getProducts().then(res => setProducts(res.data));
    adminService.getCategories().then(res => setCategories(res.data));
  }, []);

  /* ================= CATEGORY FLOW ================= */
useEffect(() => {
  if (!form.category) {
    setSubcategories([]);
    setProductTypes([]);
    return;
  }

  adminService
    .getSubcategories(form.category.toLowerCase())
    .then(res => {
      setSubcategories(res.data);

      // ✅ Reset only when adding new product
      if (!isEdit) {
        setForm(f => ({
          ...f,
          subcategory: '',
          productType: ''
        }));
      }
    })
    .catch(() => {
      setSubcategories([]);
      setProductTypes([]);
    });

}, [form.category]);


 useEffect(() => {
  if (!form.category || !form.subcategory) {
    setProductTypes([]);
    return;
  }

  adminService
    .getProductTypes(
      form.category.toLowerCase(),
      form.subcategory
    )
    .then(res => {
      setProductTypes(res.data);

      // ✅ Reset only when adding
      if (!isEdit) {
        setForm(f => ({
          ...f,
          productType: ''
        }));
      }
    })
    .catch(() => {
      setProductTypes([]);
    });

}, [form.subcategory]);

//   useEffect(() => {
//   validateForm();
// }, [form, images, imageFile]);

  /* ================= DISCOUNT ================= */
  useEffect(() => {
    const mrp = Number(form.mrp);
    const sp = Number(form.sellingPrice);

    if (mrp > 0 && sp > 0 && sp < mrp) {
      const d = Math.round(((mrp - sp) / mrp) * 100);
      setForm(f => ({ ...f, discount: `${d}%` }));
    } else {
      setForm(f => ({ ...f, discount: '' }));
    }
  }, [form.mrp, form.sellingPrice]);

  /* ================= HELPERS ================= */

  const resetForm = () => {
  setIsEdit(false);
  setEditingId(null);
  setImages([]);
  setImageFiles([]);
  // setImageFile(null);
  // setPreview(null);
  setErrors({}); // ✅ CLEAR ERRORS HERE

  setForm({
    productName: '',
    description: '',
    category: '',
    subcategory: '',
    productType: '',
    brand: '',
    mrp: '',
    sellingPrice: '',
    discount: '',
    stock: '',
    lowStock: '',
    sizes: [],
    colors: [],
  });
};


  const openAdd = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = async (id: string) => {
    const res = await adminService.getProduct(id);
    setIsEdit(true);
    setEditingId(id);
    // setImages(res.data.images || []);
   setImages(
  (res.data.images || []).map((img: string | ImageType) =>
    typeof img === 'string'
      ? { url: img, public_id: undefined }
      : img
  )
);
    setForm({
      productName: res.data.productName,
      description: res.data.shortDesc || '',
      category: res.data.category,
      subcategory: res.data.subcategory || '',
      productType: res.data.productType || '',
      brand: res.data.brand || '',
      mrp: String(res.data.mrp),
      sellingPrice: String(res.data.sellingPrice),
      discount: res.data.discount || '',
      stock: String(res.data.stock),
      lowStock: String(res.data.lowStock || ''),
      sizes: res.data.size || [],
      colors: res.data.colors || [],
    });
    setOpen(true);
  };

  /* ================= IMAGE UPLOAD ================= */
//   const handleImageUpload = (files: FileList | null) => {
//     if (!files) return;

//     const file = files[0];

//     if (!file.type.startsWith('image/')) {
//       toast({ title: 'Please upload an image file' });
//       return;
//     }

//    if (file.size > 3 * 1024 * 1024) {
//   toast({
//     title: 'Image too large',
//     description: 'Max size allowed is 3MB',
//   });
//   return;
// }

//     //  NO UPLOAD HERE
//     setImageFile(file);
//     // setImages([URL.createObjectURL(file)]); // preview only
// setPreview(URL.createObjectURL(file));

//   };

const handleImageUpload = (files: FileList | null) => {
  if (!files) return;

  const newFiles = Array.from(files);

  const total = images.length + imageFiles.length + newFiles.length;

  if (total > MAX_IMAGES) {
    toast({ title: `Max ${MAX_IMAGES} images allowed` });
    return;
  }

  const validFiles = newFiles.filter(file => file.type.startsWith('image/'));

  setImageFiles(prev => [...prev, ...validFiles]);
};

  // const removeImage = (index: number) => {
  //   setImages([]);
  //   // setImageFile(null);
  //   // setPreview(null);
  // };

  const validateForm = () => {
  const newErrors: Record<string, string> = {};

  const mrp = Number(form.mrp);
  const sellingPrice = Number(form.sellingPrice);
  const stock = Number(form.stock);

  if (!form.productName.trim())
    newErrors.productName = 'Product name is required';

  if (!form.description.trim())
    newErrors.description = 'Description is required';

  if (!form.category)
    newErrors.category = 'Category is required';

  if (!form.subcategory)
    newErrors.subcategory = 'Subcategory is required';

  if (!form.productType)
    newErrors.productType = 'Product type is required';

  if (!form.brand.trim())
  newErrors.brand = 'Brand is required';

  if (!form.mrp)
    newErrors.mrp = 'MRP is required';
  else if (mrp <= 0)
    newErrors.mrp = 'MRP must be greater than 0';

  if (!form.sellingPrice)
    newErrors.sellingPrice = 'Selling price is required';
  else if (sellingPrice <= 0)
    newErrors.sellingPrice = 'Selling price must be greater than 0';
  else if (sellingPrice > mrp)
    newErrors.sellingPrice = 'Selling price cannot exceed MRP';

  if (!form.stock)
    newErrors.stock = 'Stock is required';
  else if (stock < 0)
    newErrors.stock = 'Stock cannot be negative';

  if (form.sizes.length === 0)
    newErrors.sizes = 'Select at least one size';

  if (images.length === 0 && imageFiles.length === 0)
    newErrors.images = 'Product image is required';

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

  /* ================= SUBMIT ================= */
 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  const mrp = Number(form.mrp);
  const sellingPrice = Number(form.sellingPrice);
  const stock = Number(form.stock);

  // ================= REQUIRED FIELD VALIDATION =================
  if (!form.productName.trim()) {
    return toast({ title: 'Product name is required', variant: 'destructive' });
  }

  if (!form.brand.trim()) {
  return toast({ title: 'Brand is required', variant: 'destructive' });
}

  if (!form.description.trim()) {
    return toast({ title: 'Description is required', variant: 'destructive' });
  }

  if (!form.category) {
    return toast({ title: 'Category is required', variant: 'destructive' });
  }

  if (!form.subcategory) {
    return toast({ title: 'Subcategory is required', variant: 'destructive' });
  }

  if (!form.productType) {
    return toast({ title: 'Product type is required', variant: 'destructive' });
  }

  if (!form.mrp) {
    return toast({ title: 'MRP is required', variant: 'destructive' });
  }

  if (!form.sellingPrice) {
    return toast({ title: 'Selling price is required', variant: 'destructive' });
  }

  if (!form.stock) {
    return toast({ title: 'Stock is required', variant: 'destructive' });
  }

  if (form.sizes.length === 0) {
    return toast({ title: 'Select at least one size', variant: 'destructive' });
  }

  // if (images.length === 0 && !imageFile)
  if (images.length === 0 && imageFiles.length === 0) {
    return toast({ title: 'Product image is required', variant: 'destructive' });
  }

  // ================= PRICE VALIDATION =================
  if (mrp <= 0) {
    return toast({ title: 'MRP must be greater than 0', variant: 'destructive' });
  }

  if (sellingPrice <= 0) {
    return toast({ title: 'Selling price must be greater than 0', variant: 'destructive' });
  }

  if (sellingPrice > mrp) {
    return toast({
      title: 'Selling price cannot be greater than MRP',
      variant: 'destructive'
    });
  }

  // ================= STOCK VALIDATION =================
  if (stock < 0) {
    return toast({
      title: 'Stock cannot be negative',
      variant: 'destructive'
    });
  }

  // let uploadedImages: string[] = images;
  // let uploadedImages = images;

  // Upload image only when needed
//   if (imageFile) {
//     const res = await adminService.uploadImage(imageFile);
//     // uploadedImages = [res.data.path];
//     uploadedImages = [
//   {
//     url: res.data.url,
//     public_id: res.data.public_id
//   }
// ];
//   }
const uploadedImages = [...images];

for (const file of imageFiles) {
  const res = await adminService.uploadImage(file);

  uploadedImages.push({
    url: res.data.url,
    public_id: res.data.public_id
  });
}

setLoading(true);
  const payload = {
    productName: form.productName.trim(),
    shortDesc: form.description.trim(),
    category: form.category,
    subcategory: form.subcategory,
    productType: form.productType,
    brand: form.brand,
    mrp,
    sellingPrice,
    discount: form.discount,
    stock,
    lowStock: Number(form.lowStock) || 0,
    size: form.sizes,
    colors: form.colors,
    images: uploadedImages,
  };

  if (isEdit && editingId) {
      await adminService.updateProduct(editingId, payload);
      toast({ title: '✅ Product Updated Successfully' });
    } else {
      await adminService.createProduct(payload);
      toast({ title: '🎉 Product Added Successfully' });
    }

  setOpen(false);
  resetForm();
  adminService.getProducts().then(res => setProducts(res.data));
  setLoading(false);
};


  const askDelete = (id: string) => {
    console.log('Product delete id:', id);
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    await adminService.deleteProduct(deleteId);
    setProducts(p => p.filter(x => x._id !== deleteId));
    toast({ title: 'Product Deleted' });

    setDeleteOpen(false);
    setDeleteId(null);
  };


  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchText =
      p.productName.toLowerCase().includes(q) ||
      (p.shortDesc || '').toLowerCase().includes(q);
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchText && matchCat;
  });

  /* ================= UI ================= */

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* HEADER */}
        <div className="flex justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your store inventory</p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>

        {/* FILTERS */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" />
            <Input
              placeholder="Search products..."
              className="pl-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(c => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* GRID */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  {filteredProducts.length === 0 ? (
    <div className="col-span-full">
      <EmptyState
        icon={Package}
        title={
          products.length === 0
            ? 'No products yet'
            : 'No products found'
        }
        description={
          products.length === 0
            ? 'Start by adding your first product to showcase in the store.'
            : 'Try changing your search or category filter.'
        }
        action={
          products.length === 0 && (
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          )
        }
      />
    </div>
  ) : (
    filteredProducts.map(p => {
      const stock = Number(p.stock || 0);
      const lowStock = Number(p.lowStock || 0);

      const isOutOfStock = stock === 0;
      const isLowStock = stock > 0 && stock <= lowStock;

      return (
        <div
          key={p._id}
          className={`group rounded-xl p-3 transition border shadow-sm
            ${
              isOutOfStock
                ? 'bg-red-100 border-red-300'
                : isLowStock
                ? 'bg-red-50 border-red-200'
                : 'bg-green-50 border-green-200'
            }
          `}
        >
          {/* IMAGE */}
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <img
              // src={
              //   p.images?.[0]
              //     ? `${API_URL}/${encodeURI(p.images[0])}`
              //     : '/placeholder-product.png'
              // }
              src={
  p.images?.[0]?.url
    ? p.images[0].url
    : '/placeholder-product.png'
}
              className="w-full h-full object-cover rounded-lg"
            />

            {/* HOVER ACTIONS */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
              <Button size="icon" onClick={() => openEdit(p._id)}>
                <Edit2 />
              </Button>
              <Button
                size="icon"
                variant="destructive"
                onClick={() => askDelete(p._id)}
              >
                <Trash2 />
              </Button>
            </div>
          </div>

          {/* INFO */}
          <h3 className="mt-3 font-medium">{p.productName}</h3>
          <p className="text-sm text-muted-foreground">{p.category}</p>

          {/* STOCK STATUS */}
          <p
            className={`text-xs font-semibold mt-1
              ${
                isOutOfStock
                  ? 'text-red-700'
                  : isLowStock
                  ? 'text-red-600'
                  : 'text-green-600'
              }
            `}
          >
            {isOutOfStock
              ? 'Out of Stock'
              : isLowStock
              ? `Low Stock (${stock} left)`
              : `In Stock (${stock})`}
          </p>

          {/* PRICE */}
          <p className="font-semibold mt-1">
            ₹{p.sellingPrice}
          </p>
        </div>
      );
    })
  )}
</div>

      </div>

      {/* MODAL */}
      <Dialog
  open={open}
  onOpenChange={(val) => {
    setOpen(val);
    if (!val) resetForm(); // when modal closes
  }}
>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* IMAGE UPLOAD */}

<div>
  {/* <div className="flex gap-3 mt-2">
    {images.map((img, i) => (
      <div key={i} className="relative">
        <img
          src={
            img.startsWith('blob:')
              ? img
              : `${API_URL}/${encodeURI(img)}`
          }
          className="w-24 h-24 rounded object-cover"
        />

        <button
          type="button"
          onClick={() => removeImage(i)}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
        >
          <X size={14} />
        </button>
      </div>
    ))}

    {images.length < MAX_IMAGES && (
      <label
        htmlFor="product-image-upload"
        className="w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted transition text-muted-foreground"
      >
        <Upload size={20} />
        <span className="text-xs text-center">
          Upload<br />Product Image
        </span>

        <input
          id="product-image-upload"
          type="file"
          accept="image/*"
          hidden
          onChange={e => handleImageUpload(e.target.files)}
        />
      </label>
    )}
  </div> */}
  <div className="flex gap-3 mt-2">

  {/* {preview ? (
    <div className="relative">
      <img
        src={preview}
        className="w-24 h-24 rounded object-cover"
      />
      <button
        type="button"
        onClick={() => {
          setPreview(null);
          setImageFile(null);
        }}
        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
      >
        <X size={14} />
      </button>
    </div>
  ) : images[0]?.url ? (
    <div className="relative">
      <img
        src={images[0].url}
        className="w-24 h-24 rounded object-cover"
      />
    </div>
  ) : null} */}

<div>
  <div className="flex gap-3 flex-wrap mt-2">

    {/* Existing images (edit mode) */}
    {images.map((img, i) => (
      <div key={i} className="relative">
        <img src={img.url} className="w-24 h-24 rounded object-cover" />
        <button
          type="button"
          onClick={() =>
            setImages(prev => prev.filter((_, index) => index !== i))
          }
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
        >
          <X size={14} />
        </button>
      </div>
    ))}

    {/* New uploads */}
    {imageFiles.map((file, i) => (
      <div key={i} className="relative">
        <img
          src={URL.createObjectURL(file)}
          className="w-24 h-24 rounded object-cover"
        />
        <button
          type="button"
          onClick={() =>
            setImageFiles(prev =>
              prev.filter((_, index) => index !== i)
            )
          }
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
        >
          <X size={14} />
        </button>
      </div>
    ))}

    {/* Upload button */}
    {(images.length + imageFiles.length) < MAX_IMAGES && (
      <label className="w-24 h-24 border-2 border-dashed rounded flex items-center justify-center cursor-pointer">
        <Upload />
        <input
          type="file"
          multiple
          hidden
          onChange={e => handleImageUpload(e.target.files)}
        />
      </label>
    )}

  </div>

  {/* Error */}
  {errors.images && (
    <p className="text-xs text-red-500 mt-2">
      {errors.images}
    </p>
  )}
</div>

 {/* {!preview && (
    <label
      htmlFor="product-image-upload"
      className="w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted transition text-muted-foreground"
    >
      <Upload size={20} />
      <span className="text-xs text-center">
        Upload<br />Product Image
      </span>

      <input
        id="product-image-upload"
        type="file"
        accept="image/*"
        hidden
        onChange={e => handleImageUpload(e.target.files)}
      />
    </label>
  )} */}

</div>

  {/*  IMAGE ERROR GOES HERE (OUTSIDE FLEX, INSIDE WRAPPER)
  {errors.images && (
    <p className="text-xs text-red-500 mt-2">
      {errors.images}
    </p>
  )} */}
</div>

            {/* NAME */}
            <Input
  placeholder="Product Name *"
  value={form.productName}
  onChange={e => {
    setForm({ ...form, productName: e.target.value });
    setErrors(prev => ({ ...prev, productName: '' }));
  }}
  className={errors.productName ? 'border-red-500' : ''}
/>
{errors.productName && (
  <p className="text-sm text-red-500 mt-1">{errors.productName}</p>
)}

            {/* Brand */}
            <div className="space-y-1">
  <Input
    placeholder="Brand *"
    value={form.brand}
    onChange={e =>
      setForm({ ...form, brand: e.target.value })
    }
    className={errors.brand ? 'border-red-500' : ''}
  />
  {errors.brand && (
    <p className="text-xs text-red-500">{errors.brand}</p>
  )}
</div>

            {/* DESCRIPTION */}
           <Textarea
  placeholder="Description *"
  value={form.description}
  onChange={e => {
    setForm({ ...form, description: e.target.value });
    setErrors(prev => ({ ...prev, description: '' }));
  }}
  className={errors.description ? 'border-red-500' : ''}
/>
{errors.description && (
  <p className="text-sm text-red-500 mt-1">{errors.description}</p>
)}

            {/* CATEGORY */}
           <div className="space-y-1">
  <Select
    value={form.category}
    onValueChange={v =>
      setForm({ ...form, category: v })
    }
  >
    <SelectTrigger
      className={errors.category ? 'border-red-500' : ''}
    >
      <SelectValue placeholder="Category *" />
    </SelectTrigger>

    <SelectContent>
      {categories.map(c => (
        <SelectItem key={c} value={c}>{c}</SelectItem>
      ))}
    </SelectContent>
  </Select>

  {errors.category && (
    <p className="text-xs text-red-500">
      {errors.category}
    </p>
  )}
</div>

            {/* SUBCATEGORY */}
            <Select
              value={form.subcategory}
              onValueChange={v => setForm({ ...form, subcategory: v })}

            >
              <SelectTrigger><SelectValue placeholder="Subcategory *" /></SelectTrigger>
              <SelectContent>
                {subcategories.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* PRODUCT TYPE */}
            <Select
              value={form.productType}
              onValueChange={v => setForm({ ...form, productType: v })}

            >
              <SelectTrigger><SelectValue placeholder="Product Type *" /></SelectTrigger>
              <SelectContent>
                {productTypes.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* PRICES */}
<div className="grid grid-cols-3 gap-3">

  <div className="space-y-1">
    <Input
      type="number"
      placeholder="MRP *"
      value={form.mrp}
      onChange={e => {
        setForm({ ...form, mrp: e.target.value });
        setErrors(prev => ({ ...prev, mrp: '' }));
      }}
      className={errors.mrp ? 'border-red-500' : ''}
    />
    {errors.mrp && (
      <p className="text-xs text-red-500">{errors.mrp}</p>
    )}
  </div>

  <div className="space-y-1">
    <Input
      type="number"
      placeholder="Selling Price *"
      value={form.sellingPrice}
      onChange={e => {
        setForm({ ...form, sellingPrice: e.target.value });
        setErrors(prev => ({ ...prev, sellingPrice: '' }));
      }}
      className={errors.sellingPrice ? 'border-red-500' : ''}
    />
    {errors.sellingPrice && (
      <p className="text-xs text-red-500">{errors.sellingPrice}</p>
    )}
  </div>

  <Input placeholder="Discount" value={form.discount} disabled />

</div>

            {/* STOCK */}
<div className="grid grid-cols-2 gap-3">

  <div className="space-y-1">
    <Input
      type="number"
      placeholder="Stock *"
      value={form.stock}
      onChange={e => {
        setForm({ ...form, stock: e.target.value });
        setErrors(prev => ({ ...prev, stock: '' }));
      }}
      className={errors.stock ? 'border-red-500' : ''}
    />
    {errors.stock && (
      <p className="text-xs text-red-500">{errors.stock}</p>
    )}
  </div>

  <Input
    type="number"
    placeholder="Low Stock Alert"
    value={form.lowStock}
    onChange={e => setForm({ ...form, lowStock: e.target.value })}
  />

</div>

            {/* SIZES */}
           <div>
  <Label>Sizes *</Label>
  <div className="flex flex-wrap gap-2 mt-2">
    {SIZE_OPTIONS.map(s => (
      <Button
        key={s}
        type="button"
        variant={form.sizes.includes(s) ? 'default' : 'outline'}
        onClick={() =>
          setForm(f => ({
            ...f,
            sizes: f.sizes.includes(s)
              ? f.sizes.filter(x => x !== s)
              : [...f.sizes, s],
          }))
        }
      >
        {s}
      </Button>
    ))}
  </div>

  {errors.sizes && (
    <p className="text-xs text-red-500 mt-1">{errors.sizes}</p>
  )}
</div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => {
  setOpen(false);
  resetForm(); // ✅ clear everything
}}>
                Cancel
              </Button>
             <Button type="submit" disabled={loading}>
  {loading ? (
    <span className="flex items-center gap-2">
      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      {isEdit ? 'Updating...' : 'Adding...'}
    </span>
  ) : (
    isEdit ? 'Update Product' : 'Add Product'
  )}
</Button>
            </div>

          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM MODAL */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this product?
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </AdminLayout>
  );
};

export default AdminProducts;
