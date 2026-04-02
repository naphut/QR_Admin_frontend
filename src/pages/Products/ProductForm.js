import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    price: '',
    original_price: '',
    category: '',
    color: '',
    sizes: ['S', 'M', 'L', 'XL'],
    images: [''],
    stock: '',
    is_active: true
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getProduct(id);
      const product = response.data;
      const parsedImages = JSON.parse(product.images);
      setFormData({
        code: product.code,
        name: product.name,
        description: product.description,
        price: product.price,
        original_price: product.original_price || '',
        category: product.category,
        color: product.color,
        sizes: JSON.parse(product.sizes),
        images: parsedImages,
        stock: product.stock,
        is_active: product.is_active
      });
      setPreviewImages(parsedImages.filter(img => img.trim()));
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSizeChange = (size, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, size]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        sizes: prev.sizes.filter(s => s !== size)
      }));
    }
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, images: newImages }));
    if (value.trim()) {
      setPreviewImages(newImages.filter(img => img.trim()));
    }
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, images: newImages }));
    setPreviewImages(newImages.filter(img => img.trim()));
  };

  const generateProductCode = () => {
    const categoryPrefix = formData.category.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const newCode = `${categoryPrefix}${randomNum}`;
    setFormData(prev => ({ ...prev, code: newCode }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : null,
        stock: parseInt(formData.stock),
        sizes: JSON.stringify(formData.sizes),
        images: JSON.stringify(formData.images.filter(img => img.trim()))
      };
      
      // Validation
      if (!productData.code.trim()) {
        toast.error('Product code is required');
        return;
      }
      
      if (!productData.name.trim()) {
        toast.error('Product name is required');
        return;
      }
      
      if (productData.price <= 0) {
        toast.error('Price must be greater than 0');
        return;
      }
      
      if (productData.stock < 0) {
        toast.error('Stock cannot be negative');
        return;
      }
      
      if (formData.sizes.length === 0) {
        toast.error('Please select at least one size');
        return;
      }
      
      if (id && id !== 'new') {
        await adminAPI.updateProduct(id, productData);
        toast.success('Product updated successfully');
      } else {
        await adminAPI.createProduct(productData);
        toast.success('Product created successfully');
      }
      navigate('/admin/products');
    } catch (error) {
      console.error('Error saving product:', error);
      
      // Handle specific error messages
      if (error.response?.data?.detail) {
        const errorMessage = error.response.data.detail;
        if (errorMessage.includes('already exists')) {
          toast.error('Product code already exists. Please use a unique code.');
        } else {
          toast.error(errorMessage);
        }
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/admin/login');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else {
        toast.error('Failed to save product. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '30', '32', '34', '36', '38'];
  const categories = [
    { value: 'T-Shirts', label: 'T-Shirts', icon: '👕' },
    { value: 'Jackets', label: 'Jackets', icon: '🧥' },
    { value: 'Pants', label: 'Pants', icon: '👖' },
    { value: 'Sweatshirts', label: 'Sweatshirts', icon: '👚' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {id && id !== 'new' ? 'Edit Product' : 'Create New Product'}
              </h1>
              <p className="mt-2 text-gray-600">
                {id && id !== 'new' 
                  ? 'Update product information and details' 
                  : 'Add a new product to your store inventory'}
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/products')}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              ✕ Cancel
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                📦 Basic Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Code <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🏷️</span>
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        required
                        placeholder="e.g., PRD-001"
                        className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={generateProductCode}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                    >
                      🎲 Generate
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Unique identifier for this product</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter product name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe your product..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                💰 Pricing & Inventory
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      step="0.01"
                      required
                      placeholder="0.00"
                      className="pl-8 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      name="original_price"
                      value={formData.original_price}
                      onChange={handleChange}
                      step="0.01"
                      placeholder="0.00"
                      className="pl-8 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Category & Attributes Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                🔧 Category & Attributes
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.icon} {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🎨</span>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleChange}
                      required
                      placeholder="e.g., Black, Red, Blue"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Sizes <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {sizeOptions.map(size => (
                      <label key={size} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.sizes.includes(size)}
                          onChange={(e) => handleSizeChange(size, e.target.checked)}
                          className="hidden"
                        />
                        <div className={`
                          px-4 py-2 rounded-lg border-2 transition-all cursor-pointer
                          ${formData.sizes.includes(size) 
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                            : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow-sm'
                          }
                        `}>
                          📏 {size}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Images Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-orange-50 to-red-50 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                🖼️ Product Images
              </h2>
            </div>
            <div className="p-6">
              {/* Image Previews */}
              {previewImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Image Previews</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {previewImages.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={img} 
                          alt={`Preview ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Image URLs Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Image URLs
                </label>
                {formData.images.map((image, index) => (
                  <div key={index} className="flex gap-2 mb-3">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => handleImageChange(index, e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        🗑️ Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addImage}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  ➕ Add Another Image
                </button>
              </div>
            </div>
          </div>

          {/* Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                ⚙️ Product Status
              </h2>
            </div>
            <div className="p-6">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`
                    w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
                    ${formData.is_active ? 'bg-blue-600' : 'bg-gray-300'}
                  `}>
                    <div className={`
                      w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out
                      ${formData.is_active ? 'translate-x-5' : 'translate-x-0'}
                    `} />
                  </div>
                </div>
                <div className="ml-3">
                  <span className="text-sm font-medium text-gray-700">
                    {formData.is_active ? (
                      <span className="flex items-center gap-1">
                        👁️ Active (visible to customers)
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        👁️‍🗨️ Inactive (hidden from customers)
                      </span>
                    )}
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-medium flex items-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  💾 Save Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;