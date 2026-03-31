import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import api from '@/lib/api';
import { QRCodeCanvas } from 'qrcode.react';

const UPI_ID = 'MSMONETHREESCREATIONSLLP.eazypay@icici';
const UPI_NAME = 'MS MONETHREES CREATIONS';

const capitalizeWords = (value: string) =>
  value.replace(/\b\w/g, char => char.toUpperCase());

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { items, totalPrice, clearCart } = useCart();

  const [profileData, setProfileData] = useState<any>(null);
  const [useDefaultAddress, setUseDefaultAddress] = useState(true);
  const [loading, setLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [upiTxnId, setUpiTxnId] = useState('');
  const [upiNote, setUpiNote] = useState('');
  const [upiUrl, setUpiUrl] = useState('');
  const [showQR, setShowQR] = useState(false);

  const emptyAddress = {
    fullName: '',
    mobile: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  };

  const [shippingAddress, setShippingAddress] = useState(emptyAddress);

  // ===== FETCH USER =====
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setProfileData(res.data);

        if (res.data?.address?.addressLine1) {
          setUseDefaultAddress(true);
          fillDefaultAddress(res.data);
        } else {
          setUseDefaultAddress(false);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const fillDefaultAddress = (data?: any) => {
    const source = data || profileData;
    if (!source) return;

    setShippingAddress({
      fullName: source.name || '',
      mobile: source.mobile || '',
      addressLine1: source.address?.addressLine1 || '',
      addressLine2: source.address?.addressLine2 || '',
      city: source.address?.city || '',
      state: source.address?.state || '',
      postalCode: source.address?.postalCode || '',
      country: source.address?.country || 'India',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'city' || name === 'state') {
      setShippingAddress(prev => ({
        ...prev,
        [name]: capitalizeWords(value),
      }));
      return;
    }
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!shippingAddress.fullName.trim()) return 'Full name required';
    if (!/^[6-9]\d{9}$/.test(shippingAddress.mobile)) return 'Invalid mobile';
    if (!shippingAddress.addressLine1.trim()) return 'Building required';
    if (!shippingAddress.city.trim()) return 'City required';
    if (!shippingAddress.state.trim()) return 'State required';
    if (!/^\d{6}$/.test(shippingAddress.postalCode)) return 'Invalid pincode';
    if (items.length === 0) return 'Cart empty';

    if (paymentMethod === 'ONLINE') {
      if (!paymentScreenshot) return 'Upload payment screenshot';
      if (!upiTxnId.trim()) return 'Enter UPI Transaction ID';
    }
    return null;
  };

  const handlePayClick = () => {
    const amount = totalPrice.toFixed(2);
    const ref = `MSC-${Date.now()}`;

    const url =
      `upi://pay?pa=${UPI_ID}` +
      `&pn=${encodeURIComponent(UPI_NAME)}` +
      `&am=${amount}` +
      `&cu=INR` +
      `&tn=${encodeURIComponent("Order " + ref)}`;

    setUpiNote(ref);
    setUpiUrl(url);

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) window.location.href = url;
    else setShowQR(true);
  };

  const handleCheckout = async () => {
    const error = validate();
    if (error) {
      toast({ title: 'Validation Error', description: error, variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('shippingAddress', JSON.stringify(shippingAddress));
      formData.append('paymentMethod', paymentMethod);
      formData.append('upiTxnId', upiTxnId);
      formData.append('upiNote', upiNote);
      if (paymentScreenshot) formData.append('paymentScreenshot', paymentScreenshot);

      const res = await api.post('/orders/checkout', formData);

      toast({
        title: 'Order placed 🎉',
        description: `Order ID: ${res.data.orderId}`,
      });

      clearCart();
      navigate('/orders');
    } catch (err: any) {
      toast({
        title: 'Checkout failed',
        description: err?.response?.data?.message || 'Server error',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container-custom max-w-5xl py-6 grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="md:col-span-2 space-y-4">

          <div className="border rounded-lg p-4 bg-white">
            <h2 className="font-semibold text-lg mb-4">Delivery Address</h2>

            {/* RADIO SECTION */}
            <div className="mb-4 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={useDefaultAddress}
                  onChange={() => {
                    setUseDefaultAddress(true);
                    fillDefaultAddress();
                  }}
                />
                Use Default Address
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={!useDefaultAddress}
                  onChange={() => {
                    setUseDefaultAddress(false);
                    setShippingAddress(emptyAddress);
                  }}
                />
                Enter Different Address
              </label>
            </div>

            {/* FORM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input name="fullName" value={shippingAddress.fullName} onChange={handleChange} />
              </div>

              <div>
                <Label>Mobile</Label>
                <Input
                  name="mobile"
                  maxLength={10}
                  value={shippingAddress.mobile}
                  onChange={(e) =>
                    setShippingAddress(prev => ({
                      ...prev,
                      mobile: e.target.value.replace(/\D/g, ''),
                    }))
                  }
                />
              </div>

              <div className="md:col-span-2">
                <Label>Building Name / House No *</Label>
                <Input name="addressLine1" value={shippingAddress.addressLine1} onChange={handleChange} />
              </div>

              <div className="md:col-span-2">
                <Label>Road, Area, Colony</Label>
                <Input name="addressLine2" value={shippingAddress.addressLine2} onChange={handleChange} />
              </div>

              <div>
                <Label>City</Label>
                <Input name="city" value={shippingAddress.city} onChange={handleChange} />
              </div>

              <div>
                <Label>State</Label>
                <Input name="state" value={shippingAddress.state} onChange={handleChange} />
              </div>

              <div>
                <Label>Postal Code</Label>
                <Input
                  name="postalCode"
                  maxLength={6}
                  value={shippingAddress.postalCode}
                  onChange={(e) =>
                    setShippingAddress(prev => ({
                      ...prev,
                      postalCode: e.target.value.replace(/\D/g, ''),
                    }))
                  }
                />
              </div>
            </div>
          </div>

          {paymentMethod === 'ONLINE' && (
            <div className="border rounded-lg p-5 bg-white space-y-5">

              <div className="bg-blue-50 p-3 rounded text-sm space-y-2">
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded text-yellow-800">
                  Your order will be confirmed only after payment verification.
                </div>
                <p className="font-medium">Payment Instructions:</p>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Click "Pay with UPI"</li>
                  <li>Complete payment in your UPI app</li>
                  <li>Enter UPI Transaction ID</li>
                  <li>Upload payment screenshot</li>
                </ol>
              </div>

              <Button type="button" className="w-full" onClick={handlePayClick}>
                Pay with UPI
              </Button>

              {showQR && (
                <div className="text-center space-y-3 border p-4 rounded-lg">
                  <QRCodeCanvas value={upiUrl} size={220} />
                </div>
              )}

              <div>
                <Label>UPI Transaction ID *</Label>
                <Input value={upiTxnId} onChange={(e) => setUpiTxnId(e.target.value)} />
              </div>

              <div>
                <Label>Upload Payment Screenshot *</Label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full border rounded-md p-2"
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      setPaymentScreenshot(e.target.files[0]);
                    }
                  }}
                />
              </div>

            </div>
          )}

        </div>

        <div className="border rounded-lg p-4 bg-white h-fit">
          <h2 className="font-semibold mb-3">Payment</h2>

          <select
            className="w-full border rounded-md p-2"
            value={paymentMethod}
            onChange={e => setPaymentMethod(e.target.value as any)}
          >
            <option value="COD">Cash on Delivery</option>
            <option value="ONLINE">Online UPI</option>
          </select>

          <Button
            className="w-full mt-5"
            disabled={loading}
            onClick={handleCheckout}
          >
            {loading ? 'Placing Order...' : 'Place Order'}
          </Button>
        </div>

      </div>
    </Layout>
  );
};

export default Checkout;