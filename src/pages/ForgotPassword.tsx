import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';
import authImage from '@/assets/MS CREATIONS LOGO NEW.svg';

type ForgotStep = 'email' | 'otp' | 'reset' | 'complete';

const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: 'Weak', color: 'bg-red-500', width: '33%' };
  if (score <= 4) return { label: 'Medium', color: 'bg-yellow-500', width: '66%' };
  return { label: 'Strong', color: 'bg-green-500', width: '100%' };
};

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<ForgotStep>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const { sendOtp, verifyOtp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Timer
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // SEND OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email required');
      return;
    }

    try {
      setIsLoading(true);
      const result = await sendOtp(email, 'FORGOT_PASSWORD');

      if (result.success) {
        toast({ title: 'OTP Sent', description: 'Check your email.' });
        setOtp('');
        setStep('otp');
        setTimer(60);
      } else {
        setEmailError(result.error || 'Email not registered');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // VERIFY OTP
  const handleVerifyOtp = async () => {
  if (otp.length !== 6) return;

  try {
    setIsLoading(true);

    const result = await verifyOtp(email, otp, 'FORGOT_PASSWORD');

    if (result.success) {
      toast({ title: 'OTP Verified Successfully' });
      setStep('reset');
    } else {
      if (result.error === 'OTP_EXPIRED') {
        toast({
          title: 'OTP Expired',
          description: 'Please request a new OTP.',
          variant: 'destructive',
        });
      } else if (result.error === 'TOO_MANY_ATTEMPTS') {
        toast({
          title: 'Too Many Attempts',
          description: 'Please request a new OTP.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Invalid OTP',
          description: 'Please enter correct OTP.',
          variant: 'destructive',
        });
      }
    }
  } finally {
    setIsLoading(false);
  }
};

  // RESEND OTP
  const handleResendOtp = async () => {
    if (timer > 0) return;

    try {
      setIsLoading(true);
      const result = await sendOtp(email, 'FORGOT_PASSWORD');

      if (result.success) {
        toast({ title: 'OTP Resent' });
        setOtp('');
        setTimer(60);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // RESET PASSWORD
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword({ email, otp, newPassword });

      toast({ title: 'Password Reset Successful' });
      setStep('complete');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">

      <div className="hidden lg:block lg:w-1/2">
        <img src={authImage} alt="Auth" className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md space-y-8">

          <div className="text-center">
            <Link to="/" className="text-3xl font-bold text-primary">
              MS<span className="text-foreground"> Creations</span>
            </Link>
          </div>

          {/* EMAIL */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <h1 className="text-3xl font-bold text-center">Forgot Password?</h1>

              <div>
                <Label>Email</Label>
                <Input
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError('');
                  }}
                  className="h-12"
                />
                {emailError && (
                  <p className="text-sm text-red-500 mt-1">{emailError}</p>
                )}
              </div>

              <Button className="w-full h-12" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Code'}
              </Button>
            </form>
          )}

          {/* OTP */}
          {step === 'otp' && (
            <div className="space-y-6 text-center">
              <h1 className="text-3xl font-bold">Verify Code</h1>

              <div className="flex justify-center">
                <InputOTP value={otp} onChange={setOtp} maxLength={6}>
                  <InputOTPGroup className="gap-3">
                    {[0,1,2,3,4,5].map((i) => (
                      <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg border-2 rounded-md" />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerifyOtp}
                className="w-full h-12"
                disabled={otp.length !== 6 || isLoading}
              >
                Verify Code
              </Button>

              <button
                onClick={handleResendOtp}
                disabled={timer > 0}
                className="text-sm text-primary"
              >
                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
              </button>
            </div>
          )}

          {/* RESET */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <h1 className="text-3xl font-bold text-center">Reset Password</h1>

              <div>
  <Label>New Password</Label>
  <div className="relative">
    <Input
      type={showNewPassword ? 'text' : 'password'}
      value={newPassword}
      onChange={(e) => setNewPassword(e.target.value)}
      className="h-12 pr-10"
    />
    <button
      type="button"
      onClick={() => setShowNewPassword(!showNewPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
    >
      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>

  {newPassword && (
    <div className="mt-2">
      <div className="h-2 bg-gray-200 rounded">
        <div
          className={`h-2 rounded ${getPasswordStrength(newPassword).color}`}
          style={{ width: getPasswordStrength(newPassword).width }}
        />
      </div>
      <p className="text-xs mt-1">
        Strength: {getPasswordStrength(newPassword).label}
      </p>
    </div>
  )}
</div>

             <div>
  <Label>Confirm Password</Label>
  <div className="relative">
    <Input
      type={showConfirmPassword ? 'text' : 'password'}
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
      className="h-12 pr-10"
    />
    <button
      type="button"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
    >
      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  </div>
</div>

              <Button className="w-full h-12">
                Reset Password
              </Button>
            </form>
          )}

          {/* COMPLETE */}
          {step === 'complete' && (
            <div className="text-center space-y-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h1 className="text-3xl font-bold">Password Reset!</h1>
              <Button onClick={() => navigate('/login')} className="w-full h-12">
                Go to Login
              </Button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}; 

export default ForgotPassword;