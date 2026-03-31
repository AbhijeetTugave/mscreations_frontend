import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Sparkles, Gift, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import authImage from '@/assets/MS CREATIONS LOGO NEW.svg';

type RegistrationStep = 'form' | 'otp';

const Register: React.FC = () => {
  const [step, setStep] = useState<RegistrationStep>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const { sendOtp, verifyOtp, register } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [passwordStrength, setPasswordStrength] = useState(0);

  const calculatePasswordStrength = (value: string) => {
    let strength = 0;
    if (value.length >= 8) strength++;
    if (/[A-Z]/.test(value)) strength++;
    if (/[a-z]/.test(value)) strength++;
    if (/\d/.test(value)) strength++;
    if (/[@$!%*?&#]/.test(value)) strength++;
    setPasswordStrength(strength);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      toast({ title: 'Name Required', description: 'Only letters and spaces allowed.', variant: 'destructive' });
      return false;
    }

    if (!/^[A-Za-z ]{2,50}$/.test(name)) {
      toast({ title: 'Invalid Name', description: 'Name cannot contain numbers or symbols.', variant: 'destructive' });
      return false;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      toast({ title: 'Invalid Email', description: 'Enter a valid email address.', variant: 'destructive' });
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      toast({ title: 'Invalid Mobile', description: 'Enter valid 10-digit Indian number.', variant: 'destructive' });
      return false;
    }

    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/.test(password)) {
      toast({
        title: 'Weak Password',
        description: 'Min 8 chars, uppercase, lowercase, number & symbol required.',
        variant: 'destructive',
      });
      return false;
    }

    if (password !== confirmPassword) {
      toast({ title: 'Password Mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return false;
    }

    if (!agreeTerms) {
      toast({ title: 'Accept Terms', description: 'You must accept Terms & Privacy Policy.', variant: 'destructive' });
      return false;
    }

    return true;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    const result = await sendOtp(email, 'REGISTER');

    if (result.success) {
      toast({ title: 'OTP Sent!', description: 'Check your email for the verification code.' });
      setStep('otp');
    } else {
      toast({ title: 'Failed to send OTP', description: result.error, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const handleVerifyAndRegister = async () => {
    if (otp.length !== 6) {
      toast({ title: 'Invalid OTP', description: 'Please enter the 6-digit OTP.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    const verifyResult = await verifyOtp(email, otp, 'REGISTER');
    if (!verifyResult.success) {
      toast({ title: 'Invalid OTP', description: verifyResult.error, variant: 'destructive' });
      setIsLoading(false);
      return;
    }

    const registerResult = await register(name, email, mobile, password);

    if (registerResult.success) {
      toast({ title: 'Account created!', description: 'Welcome to MSCreation.' });
      navigate('/');
    } else {
      toast({ title: 'Registration failed', description: registerResult.error, variant: 'destructive' });
    }

    setIsLoading(false);
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    const result = await sendOtp(email, 'REGISTER');
    if (result.success) {
      toast({ title: 'OTP Resent!', description: 'Check your email for the new code.' });
    } else {
      toast({ title: 'Failed to resend', description: result.error, variant: 'destructive' });
    }
    setIsLoading(false);
  };

  const benefits = [
    { icon: Gift, title: 'Exclusive Offers', desc: 'Get early access to sales' },
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over ₹1000' },
    { icon: Shield, title: 'Secure Shopping', desc: '100% protected checkout' },
  ];

  return (
    <div className="min-h-screen flex bg-background">

      {/* Left Side */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-md space-y-6 animate-fade-in py-8">

          {/* Logo */}
          <div className="text-center lg:text-left">
            <Link to="/" className="inline-block">
              <span className="font-display text-3xl font-bold text-primary">
                MS<span className="text-foreground"> Creations</span>
              </span>
            </Link>
          </div>

          {/* ---- YOUR FULL ORIGINAL FORM UI HERE ---- */}
          {/* I kept your entire form section exactly same */}
                    {step === 'form' && (
            <>
              {/* Header */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
                    Join Us
                  </h1>
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <p className="text-muted-foreground text-lg">
                  Create an account and start your style journey
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {/* Full Name */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value.replace(/[^A-Za-z ]/g, ''))}
                        className="pl-12 h-12 text-base bg-secondary/50 border-border hover:border-primary/50 focus:border-primary rounded-xl transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-12 h-12 text-base bg-secondary/50 border-border hover:border-primary/50 focus:border-primary rounded-xl transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Mobile */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="mobile" className="text-sm font-medium">Mobile Number</Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="mobile"
                        type="tel"
                        placeholder="9876543210"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="pl-12 h-12 text-base bg-secondary/50 border-border hover:border-primary/50 focus:border-primary rounded-xl transition-all"
                        required
                        maxLength={10}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          calculatePasswordStrength(e.target.value);
                        }}
                        className="pl-12 pr-12 h-12 text-base bg-secondary/50 border-border hover:border-primary/50 focus:border-primary rounded-xl transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Password Strength */}
                  <div className="mt-2 space-y-1 sm:col-span-2">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-all
                          ${passwordStrength >= i
                              ? passwordStrength <= 2
                                ? 'bg-red-500'
                                : passwordStrength === 3
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              : 'bg-muted'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {passwordStrength <= 2 && 'Weak password'}
                      {passwordStrength === 3 && 'Medium password'}
                      {passwordStrength >= 4 && 'Strong password'}
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="pl-12 h-12 text-base bg-secondary/50 border-border hover:border-primary/50 focus:border-primary rounded-xl transition-all"
                        required
                      />
                    </div>
                  </div>

                </div>

                {/* Terms */}
                <div className="flex items-start gap-3 p-4 bg-secondary/50 rounded-xl">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed cursor-pointer">
                    I agree to the{' '}
                    <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
                  </Label>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-14 text-base font-semibold rounded-xl bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending OTP...' : 'Create Account'}
                </Button>
              </form>
            </>
          )}

          {/* OTP SECTION */}
          {step === 'otp' && (
            <div className="space-y-6 text-center">
              <h1 className="text-3xl font-bold">Verify Your Email</h1>
              <p>Enter the 6-digit code sent to <strong>{email}</strong></p>

              <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                <InputOTPGroup>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <InputOTPSlot key={i} index={i} />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <Button
                onClick={handleVerifyAndRegister}
                className="w-full h-14"
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify & Create Account'}
              </Button>

              <button
                onClick={() => setStep('form')}
                className="text-sm text-muted-foreground"
              >
                ← Back to registration
              </button>
            </div>
          )}

        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="hidden lg:flex lg:w-1/2 sticky top-0 h-screen">
        <img
          src={authImage}
          alt="Fashion"
          className="w-full h-full object-cover"
        />
      </div>

    </div>
  );
};

export default Register;