import React, { useState, useEffect } from "react";
import { User, Mail, Phone, ShieldCheck, Bell, Key, Lock, Pencil, Check, X, Camera } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "../context/AuthContext";
import { db, storage } from "@/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

const Profile: React.FC = () => {
  const { currentUser } = useAuth();
  const [user, setUser] = useState({
    name: "",
    email: "",
    phone: "",
    photoURL: "",
    twoFactor: false,
  });
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Fetch user data from Firestore on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        setLoading(true);
        try {
          // Get user document from Firestore
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              name: userData.displayName || currentUser.displayName || "",
              email: currentUser.email || "",
              phone: userData.phoneNumber || "",
              photoURL: currentUser.photoURL || "",
              twoFactor: userData.twoFactorEnabled || false,
            });
          } else {
            // Set defaults if no document exists
            setUser({
              name: currentUser.displayName || "",
              email: currentUser.email || "",
              phone: "",
              photoURL: currentUser.photoURL || "",
              twoFactor: false,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  // Handle profile image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload profile image to Firebase Storage
  const uploadProfileImage = async () => {
    if (!profileImage || !currentUser) return;
    
    setUploading(true);
    try {
      // Create storage reference
      const storageRef = ref(storage, `profileImages/${currentUser.uid}`);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, profileImage);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update user profile with new photoURL
      await updateProfile(currentUser, {
        photoURL: downloadURL
      });
      
      // Update Firestore user document
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        photoURL: downloadURL
      });
      
      // Update local state
      setUser(prev => ({ ...prev, photoURL: downloadURL }));
      setImagePreview(null);
      
      console.log("Profile image updated successfully");
    } catch (error) {
      console.error("Error uploading profile image:", error);
    } finally {
      setUploading(false);
      setProfileImage(null);
    }
  };

  // Handlers for Profile Editing
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const toggleProfileEdit = () => {
    setIsEditingProfile(!isEditingProfile);
  };

  const saveProfile = async () => {
    if (!currentUser) return;
    
    try {
      // Update authentication profile
      await updateProfile(currentUser, {
        displayName: user.name
      });
      
      // Update Firestore user document
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        displayName: user.name
      });
      
      setIsEditingProfile(false);
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Handlers for Personal Info Editing
  const handleInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const toggleInfoEdit = () => {
    setIsEditingInfo(!isEditingInfo);
  };

  const saveInfo = async () => {
    if (!currentUser) return;
    
    try {
      // Update Firestore user document
      const userDocRef = doc(db, "users", currentUser.uid);
      await updateDoc(userDocRef, {
        phoneNumber: user.phone
      });
      
      setIsEditingInfo(false);
      console.log("Personal info updated successfully");
    } catch (error) {
      console.error("Error updating personal info:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-crypto-blue"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Profile</h1>

      {/* Profile Header */}
      <div className="dashboard-card flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
            {user.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={32} className="text-gray-400" />
            )}
          </div>
          
          <label 
            htmlFor="profile-image-upload"
            className="absolute bottom-0 right-0 bg-crypto-blue text-white p-1.5 rounded-full cursor-pointer hover:bg-crypto-blue/90 transition-colors"
          >
            <Camera size={16} />
            <input 
              id="profile-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        {imagePreview && (
          <div className="mt-4 p-4 border rounded-lg bg-gray-50 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-3">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={uploadProfileImage}
              disabled={uploading}
              className="py-1.5 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Save Image"}
            </button>
          </div>
        )}

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
                disabled
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
              <div className="mb-3">
                <label className="block text-sm text-gray-500 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={user.email}
                  disabled
                  className="w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Contact support to change your email address
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={user.phone}
                  onChange={handleInfoChange}
                  placeholder="Enter Phone Number"
                  className="w-full p-2 border rounded-md focus:outline-none"
                />
              </div>
              
              <InfoItem 
                icon={ShieldCheck} 
                label="Two-Factor Authentication" 
                value="Enabled" 
                highlight 
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
const InfoItem: React.FC<{ 
  icon: React.ComponentType<any>; 
  label: string; 
  value: string; 
  highlight?: boolean 
}> = ({ icon: Icon, label, value, highlight }) => {
  return (
    <div className="flex items-center py-2">
      <div className="p-2 rounded-full bg-gray-100 text-gray-600 mr-4">
        <Icon size={18} />
      </div>

      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={cn("font-medium", highlight ? "text-green-600" : "text-gray-800")}>
          {value}
        </p>
      </div>
    </div>
  );
};

export default Profile;