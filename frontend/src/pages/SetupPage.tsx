import React, { useState, useEffect, type ChangeEvent, type FormEvent, } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface SetupFormData {
  firstName: string;
  lastName: string;
  dob: string;
  phone: string;
  country: string;
  city: string;
  postcode: string;
  street: string;
  kyc_verified: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const SetupPage: React.FC = () => {

  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<SetupFormData>({
    firstName: '', lastName: '', dob: '', phone: '',
    country: '', city: '', postcode: '', street: '',
    kyc_verified: false
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = {};

    if (step === 1) {
      if (formData.firstName.trim().length < 2) {
        newErrors.firstName = "First name must be at least 2 characters long";
      } else if (/\d/.test(formData.firstName)) {
        newErrors.firstName = "First name cannot contain numbers";
      }

      if (formData.lastName.trim().length < 2) {
        newErrors.lastName = "Last name must be at least 2 characters long";
      }

      if (!formData.dob) {
        newErrors.dob = "Date of birth is required";
      } else {
        const birthDate = new Date(formData.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();

        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        if (age < 18) {
          newErrors.dob = "You must be at least 18 years old";
        } else if (age > 120) {
          newErrors.dob = "Please enter a valid date";
        }
      }

      const cleanPhone = formData.phone.replace(/\D/g, '');

      if (cleanPhone.length < 9) {
        newErrors.phone = "Phone number must be at least 9 digits long";
      }

    } else {
      if (formData.country.trim().length < 2) {
        newErrors.country = "Country is required";
      }

      if (formData.city.trim().length < 2) {
        newErrors.city = "City is required";
      }

      if (!formData.postcode.match(/^\d{2}-\d{3}$/)) {
        newErrors.postcode = "Format XX-XXX is required";
      }

      if (formData.street.trim().length < 5) {
        newErrors.street = "Street address is too short";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleKYCVerification = () => {
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      setFormData({ ...formData, kyc_verified: true });
    }, 2000);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateStep(2)) return;

    if (!formData.kyc_verified) {
      alert("Identity verification is required to proceed.");
      return;
    }

    try {
      await api.patch('setup/', formData);
      window.location.href = '/dashboard';
    } catch (error: any) {
      if (error.response && error.response.data) {
        const backendErrors: FormErrors = {};

        Object.keys(error.response.data).forEach(key => {
          backendErrors[key] = error.response.data[key][0];
        });

        setErrors(backendErrors);
      } else {
        alert("Failed to save profile. Please try again later.");
      }
    }
  };

  const ErrorMsg = ({ field }: { field: string }) => (
    errors[field]
      ? <span className="text-red-500 text-[10px] mt-1 ml-1">{errors[field]}</span>
      : null
  );

  return (
    <div className="flex h-screen bg-[#0B0E14] text-white font-sans overflow-hidden relative">


      <div className="flex-1 flex flex-col overflow-hidden w-full">

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="max-w-2xl w-full bg-[#161B22] border border-gray-800 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl mx-auto">

            <header className="mb-6 sm:mb-8 text-center sm:text-left">
              <span className="text-[#00FF85] text-[10px] sm:text-xs font-bold tracking-widest uppercase">Account Setup</span>

              <h2 className="text-2xl sm:text-3xl font-bold mt-2">
                Complete your profile
              </h2>

              <div className="flex gap-2 mt-4 sm:mt-6">
                <div className={`h-1 flex-1 rounded transition-all duration-500 ${currentStep >= 1 ? 'bg-[#00FF85]' : 'bg-gray-700'}`} />
                <div className={`h-1 flex-1 rounded transition-all duration-500 ${currentStep === 2 ? 'bg-[#00FF85]' : 'bg-gray-700'}`} />
              </div>
            </header>

            <form
              noValidate
              onSubmit={
                currentStep === 2
                  ? handleSubmit
                  : (e) => {
                    e.preventDefault();

                    if (validateStep(1)) {
                      setCurrentStep(2);
                    }
                  }
              }
            >

              {currentStep === 1 ? (
                <section className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-300">
                    Personal Identity
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex flex-col">
                      <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`bg-[#0B0E14] border ${errors.firstName ? 'border-red-500' : 'border-gray-700'} p-3 sm:p-4 rounded-xl focus:border-[#00FF85] outline-none transition-all w-full text-sm sm:text-base`}
                      />
                      <ErrorMsg field="firstName" />
                    </div>

                    <div className="flex flex-col">
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`bg-[#0B0E14] border ${errors.lastName ? 'border-red-500' : 'border-gray-700'} p-3 sm:p-4 rounded-xl focus:border-[#00FF85] outline-none transition-all w-full text-sm sm:text-base`}
                      />
                      <ErrorMsg field="lastName" />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <input
                      type={formData.dob ? "date" : "text"}
                      name="dob"
                      placeholder="Date of Birth (DD-MM-YYYY)"
                      value={formData.dob}
                      onChange={handleChange}
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => {
                        if (!formData.dob) e.target.type = "text";
                      }}
                      className={`w-full bg-[#0B0E14] border ${errors.dob ? 'border-red-500' : 'border-gray-700'} p-3 sm:p-4 rounded-xl focus:border-[#00FF85] outline-none transition-all text-sm sm:text-base [&::-webkit-calendar-picker-indicator]:hidden`}
                    />
                    <ErrorMsg field="dob" />
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full bg-[#0B0E14] border ${errors.phone ? 'border-red-500' : 'border-gray-700'} p-3 sm:p-4 rounded-xl focus:border-[#00FF85] outline-none transition-all text-sm sm:text-base`}
                    />
                    <ErrorMsg field="phone" />
                  </div>
                </section>
              ) : (
                <section className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-gray-300">
                    Home Address
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex flex-col">
                      <input
                        type="text"
                        name="country"
                        placeholder="Country"
                        value={formData.country}
                        onChange={handleChange}
                        className={`bg-[#0B0E14] border ${errors.country ? 'border-red-500' : 'border-gray-700'} p-3 sm:p-4 rounded-xl focus:border-[#00FF85] outline-none transition-all w-full text-sm sm:text-base`}
                      />
                      <ErrorMsg field="country" />
                    </div>

                    <div className="flex flex-col">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={handleChange}
                        className={`bg-[#0B0E14] border ${errors.city ? 'border-red-500' : 'border-gray-700'} p-3 sm:p-4 rounded-xl focus:border-[#00FF85] outline-none transition-all w-full text-sm sm:text-base`}
                      />
                      <ErrorMsg field="city" />
                    </div>
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="text"
                      name="postcode"
                      placeholder="Postcode (XX-XXX)"
                      value={formData.postcode}
                      onChange={handleChange}
                      className={`w-full bg-[#0B0E14] border ${errors.postcode ? 'border-red-500' : 'border-gray-700'} p-3 sm:p-4 rounded-xl focus:border-[#00FF85] outline-none transition-all text-sm sm:text-base`}
                    />
                    <ErrorMsg field="postcode" />
                  </div>

                  <div className="flex flex-col">
                    <input
                      type="text"
                      name="street"
                      placeholder="Street Address"
                      value={formData.street}
                      onChange={handleChange}
                      className={`w-full bg-[#0B0E14] border ${errors.street ? 'border-red-500' : 'border-gray-700'} p-3 sm:p-4 rounded-xl focus:border-[#00FF85] outline-none transition-all text-sm sm:text-base`}
                    />
                    <ErrorMsg field="street" />
                  </div>

                  <div className="mt-6 p-4 border border-gray-800 rounded-xl bg-[#0B0E14]">
                    <h4 className="text-sm font-semibold text-gray-400 mb-2">
                      Identity Verification
                    </h4>

                    <p className="text-xs text-gray-500 mb-4">
                      Required for workshop reservations.
                    </p>

                    {formData.kyc_verified ? (
                      <div className="flex items-center gap-2 text-[#00FF85] font-bold p-2 bg-[#00FF85]/10 rounded-lg">
                        <span>✓ Verified</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleKYCVerification}
                        disabled={isVerifying}
                        className="w-full py-3 border border-[#00FF85] text-[#00FF85] rounded-xl font-bold hover:bg-[#00FF85]/10 transition-colors flex justify-center items-center gap-2"
                      >
                        {isVerifying ? (
                          <span className="animate-pulse">
                            Connecting to KYC provider...
                          </span>
                        ) : (
                          "Verify Identity"
                        )}
                      </button>
                    )}
                  </div>
                </section>
              )}

              <div className="flex flex-col-reverse sm:flex-row justify-between items-center mt-8 sm:mt-10 gap-4 sm:gap-0">
                {currentStep === 2 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="w-full sm:w-auto px-6 py-3 sm:py-4 text-gray-500 hover:text-white transition-colors font-medium"
                  >
                    Back
                  </button>
                ) : (
                  <div className="hidden sm:block"></div>
                )}

                <button
                  type="submit"
                  disabled={currentStep === 2 && !formData.kyc_verified}
                  className={`w-full sm:w-auto sm:ml-auto font-bold px-8 sm:px-10 py-3 sm:py-4 rounded-xl sm:rounded-2xl transition-all shadow-[0_0_20px_rgba(0,255,133,0.2)]
                    ${(currentStep === 2 && !formData.kyc_verified)
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50 shadow-none'
                      : 'bg-gradient-to-r from-[#00FF85] to-[#00E074] text-black hover:scale-105'}`}
                >
                  {currentStep === 1 ? 'Next Step' : 'Complete Setup'}
                </button>
              </div>

            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SetupPage;