import React, { useState } from "react";
import { User, Mail, Phone, ShieldCheck, Bell, Key, Lock, Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const Profile: React.FC = () => {
  // User state (Initially null)
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    twoFactor: false,
  });

  // Edit states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  // Handlers for Profile Editing
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const toggleProfileEdit = () => {
    setIsEditingProfile(!isEditingProfile);
  };

  const saveProfile = () => {
    setIsEditingProfile(false);
  };

  // Handlers for Personal Info Editing
  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const toggleInfoEdit = () => {
    setIsEditingInfo(!isEditingInfo);
  };

  const saveInfo = () => {
    setIsEditingInfo(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Profile</h1>

      {/* Profile Header */}
      <div className="dashboard-card flex flex-col md:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
          <User size={32} className="text-gray-400" />
        </div>

        <div className="flex-1 text-center md:text-left">
          {isEditingProfile ? (
            <div>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleProfileChange}
                placeholder="Enter Name"
                className="w-full p-2 border rounded-md focus:outline-none"
              />
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleProfileChange}
                placeholder="Enter Email"
                className="w-full p-2 border rounded-md focus:outline-none mt-2"
              />
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold">{user.name || "No Name Set"}</h2>
              <p className="text-gray-500">{user.email || "No Email Set"}</p>
              <p className="text-sm text-gray-500 mt-1">Member since September 2023</p>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            {isEditingProfile ? (
              <>
                <button
                  className="py-2 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  onClick={saveProfile}
                >
                  <Check size={16} className="inline-block mr-1" /> Save
                </button>
                <button
                  className="py-2 px-4 bg-gray-400 text-white rounded-lg text-sm font-medium hover:bg-gray-500 transition-colors"
                  onClick={toggleProfileEdit}
                >
                  <X size={16} className="inline-block mr-1" /> Cancel
                </button>
              </>
            ) : (
              <button
                className="py-2 px-4 bg-crypto-blue text-white rounded-lg text-sm font-medium hover:bg-crypto-blue/90 transition-colors"
                onClick={toggleProfileEdit}
              >
                <Pencil size={16} className="inline-block mr-1" /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="dashboard-card">
        <h2 className="text-xl font-semibold mb-6">Personal Information</h2>

        <div className="space-y-4">
          {isEditingInfo ? (
            <>
              <input
                type="text"
                name="email"
                value={user.email}
                onChange={handleInfoChange}
                placeholder="Enter Email"
                className="w-full p-2 border rounded-md focus:outline-none"
              />
              <input
                type="text"
                name="phone"
                value={user.phone}
                onChange={handleInfoChange}
                placeholder="Enter Phone Number"
                className="w-full p-2 border rounded-md focus:outline-none mt-2"
              />
            </>
          ) : (
            <>
              <InfoItem icon={Mail} label="Email Address" value={user.email || "Not Set"} />
              <InfoItem icon={Phone} label="Phone Number" value={user.phone || "Not Set"} />
              <InfoItem icon={ShieldCheck} label="Two-Factor Authentication" value="Enabled" highlight />
            </>
          )}
        </div>

        <div className="mt-6">
          {isEditingInfo ? (
            <>
              <button
                className="py-2 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                onClick={saveInfo}
              >
                <Check size={16} className="inline-block mr-1" /> Save
              </button>
              <button
                className="py-2 px-4 bg-gray-400 text-white rounded-lg text-sm font-medium hover:bg-gray-500 transition-colors ml-2"
                onClick={toggleInfoEdit}
              >
                <X size={16} className="inline-block mr-1" /> Cancel
              </button>
            </>
          ) : (
            <button
              className="py-2 px-4 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              onClick={toggleInfoEdit}
            >
              Update Information
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Info Item Component
const InfoItem: React.FC<{ icon: React.ComponentType<any>; label: string; value: string; highlight?: boolean }> = ({ icon: Icon, label, value, highlight }) => {
  return (
    <div className="flex items-center">
      <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-4">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={cn("font-medium", highlight ? "text-green-600" : "text-gray-800")}>{value}</p>
      </div>
    </div>
  );
};

export default Profile;
