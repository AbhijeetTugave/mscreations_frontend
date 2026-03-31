import React, { useEffect, useState } from 'react';
import { User, MapPin, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { API_URL } from '@/lib/config';
import Layout from '@/components/layout/Layout';

const Profile: React.FC = () => {
  const { user, getToken } = useAuth();
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');

  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');

  const [isLoading, setIsLoading] = useState(false);

  // ================= LOAD PROFILE =================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });

        const data = response.data;

        setName(data.name || '');
        setMobile(data.mobile || '');

        if (data.address) {
          setAddressLine1(data.address.addressLine1 || '');
          setAddressLine2(data.address.addressLine2 || '');
          setCity(data.address.city || '');
          setState(data.address.state || '');
          setPostalCode(data.address.postalCode || '');
          setCountry(data.address.country || 'India');
        }

      } catch (error: any) {
        toast({
          title: 'Failed to load profile',
          description: error?.response?.data?.message || 'Something went wrong',
          variant: 'destructive'
        });
      }
    };

    fetchProfile();
  }, []);

  // ================= UPDATE PROFILE =================
  const handleUpdate = async () => {
    if (!/^[A-Za-z ]{3,}$/.test(name.trim())) {
      toast({ title: 'Enter valid full name', variant: 'destructive' });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast({ title: 'Invalid mobile number', variant: 'destructive' });
      return;
    }

    if (!addressLine1.trim()) {
      toast({ title: 'Building Name / House No required', variant: 'destructive' });
      return;
    }

    if (!city.trim()) {
      toast({ title: 'City required', variant: 'destructive' });
      return;
    }

    if (!state.trim()) {
      toast({ title: 'State required', variant: 'destructive' });
      return;
    }

    if (!/^\d{6}$/.test(postalCode)) {
      toast({ title: 'Invalid 6 digit postal code', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      await axios.patch(
        `${API_URL}/users/profile`,
        {
          name,
          mobile,
          address: {
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
          },
        },
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        }
      );

      toast({ title: 'Profile updated successfully 🎉' });

    } catch (err: any) {
      toast({
        title: 'Update failed',
        description: err?.response?.data?.message,
        variant: 'destructive',
      });
    }

    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-8">

          {/* HEADER */}
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground">
              Manage your personal information
            </p>
          </div>

          {/* PERSONAL INFO */}
          <div className="bg-card border rounded-xl p-6 space-y-6 shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <User className="h-5 w-5" /> Personal Information
            </h2>

            <div className="space-y-4">

              <div>
                <Label>Full Name *</Label>
                <Input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value.replace(/[^A-Za-z ]/g, ''))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input value={user?.email} disabled className="mt-1" />
              </div>

              <div>
                <Label>Mobile *</Label>
                <Input
                  value={mobile}
                  onChange={(e) =>
                    setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  className="mt-1"
                />
              </div>

            </div>
          </div>

          {/* ADDRESS */}
          <div className="bg-card border rounded-xl p-6 space-y-6 shadow-sm">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MapPin className="h-5 w-5" /> Default Address
            </h2>

            <div className="space-y-4">

              <div>
                <Label>Building Name / House No *</Label>
                <Input
                  placeholder="Flat No / Building Name"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Road, Area, Colony</Label>
                <Input
                  placeholder="Road, Area, Landmark"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <Label>City *</Label>
                  <Input
                    value={city}
                    onChange={(e) =>
                      setCity(
                        e.target.value
                          .replace(/[^A-Za-z ]/g, '')
                          .replace(/\b\w/g, c => c.toUpperCase())
                      )
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>State *</Label>
                  <Input
                    value={state}
                    onChange={(e) =>
                      setState(
                        e.target.value
                          .replace(/[^A-Za-z ]/g, '')
                          .replace(/\b\w/g, c => c.toUpperCase())
                      )
                    }
                    className="mt-1"
                  />
                </div>

              </div>

              <div>
                <Label>Pincode *</Label>
                <Input
                  value={postalCode}
                  onChange={(e) =>
                    setPostalCode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  className="mt-1"
                />
              </div>

            </div>
          </div>

          {/* SAVE BUTTON */}
          <Button
            onClick={handleUpdate}
            className="w-full h-12 text-base font-semibold"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : (
              <span className="flex items-center gap-2 justify-center">
                <Save className="h-4 w-4" />
                Save Changes
              </span>
            )}
          </Button>

        </div>
      </div>
    </Layout>
  );
};

export default Profile;