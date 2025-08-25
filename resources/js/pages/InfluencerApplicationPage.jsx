import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../hooks/useApi';

const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const IconCheckCircle = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>;

export default function InfluencerApplicationPage() {
    const { api } = useApi();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        gender: '',
        date_of_birth: '',
        city: '',
        bio: '',
        social_media_profiles: [
            { platform: 'instagram', username: '', followers: '', account_created_date: '', total_posts: '', total_following: '' }
        ]
    });
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileChange = (index, e) => {
        const { name, value } = e.target;
        const profiles = [...formData.social_media_profiles];
        profiles[index][name] = value;
        setFormData(prev => ({ ...prev, social_media_profiles: profiles }));
    };

    const addProfile = () => {
        setFormData(prev => ({
            ...prev,
            social_media_profiles: [
                ...prev.social_media_profiles,
                { platform: 'tiktok', username: '', followers: '', account_created_date: '', total_posts: '', total_following: '' }
            ]
        }));
    };

    const removeProfile = (index) => {
        const profiles = formData.social_media_profiles.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, social_media_profiles: profiles }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        
        try {
            const response = await api('applyAsInfluencer', formData);
            setSuccess(response.message || 'Your application has been successfully submitted! Our team will review it shortly.');
            
            // Reset form on success
            setFormData({
                name: '',
                email: '',
                gender: '',
                date_of_birth: '',
                city: '',
                bio: '',
                social_media_profiles: [
                    { platform: 'instagram', username: '', followers: '', account_created_date: '', total_posts: '', total_following: '' }
                ]
            });
        } catch (err) {
            console.error('Application submission error:', err);
            if (err.message.includes('401') || err.message.includes('Session expired')) {
                // Session expired - handled by AuthContext automatically
            } else if (err.message.includes('422')) {
                setError('Please check your form data. Some fields may be invalid or missing.');
            } else if (err.message.includes('409') || err.message.includes('already exists')) {
                setError('An application with this email already exists. Please use a different email address.');
            } else if (err.message.includes('network')) {
                setError('Network error. Please check your connection and try again.');
            } else {
                setError(err.message || 'Failed to submit application. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                    <div className="mb-6">
                        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                            <IconCheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
                    <p className="text-gray-600 mb-6">{success}</p>
                    <div className="space-x-4">
                        <Link 
                            to="/" 
                            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700"
                        >
                            Back to Home
                        </Link>
                        <button 
                            onClick={() => {
                                setSuccess('');
                                setError('');
                            }}
                            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Submit Another Application
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Apply to Become an Influencer</h1>
                    <p className="mt-2 text-gray-600">Join our community of content creators and collaborate with amazing brands</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                                <input 
                                    type="text" 
                                    name="name" 
                                    required 
                                    value={formData.name} 
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                                <input 
                                    type="email" 
                                    name="email" 
                                    required 
                                    value={formData.email} 
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gender</label>
                                <select 
                                    name="gender" 
                                    value={formData.gender} 
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="non-binary">Non-binary</option>
                                    <option value="prefer-not-to-say">Prefer not to say</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                                <input 
                                    type="date" 
                                    name="date_of_birth" 
                                    value={formData.date_of_birth} 
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">City</label>
                                <input 
                                    type="text" 
                                    name="city" 
                                    value={formData.city} 
                                    onChange={handleInputChange}
                                    placeholder="e.g., Jakarta, Indonesia"
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Bio *</label>
                                <textarea 
                                    name="bio" 
                                    required 
                                    rows="4" 
                                    value={formData.bio} 
                                    onChange={handleInputChange}
                                    placeholder="Tell us about yourself, your content style, and what makes you unique..."
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                ></textarea>
                                <p className="mt-1 text-sm text-gray-500">Minimum 50 characters</p>
                            </div>
                        </div>
                    </div>

                    {/* Social Media Profiles */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">Social Media Profiles</h2>
                        <p className="text-sm text-gray-600 mb-4">Add at least one social media profile to showcase your influence.</p>
                        
                        {formData.social_media_profiles.map((profile, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Profile {index + 1}</h3>
                                    {formData.social_media_profiles.length > 1 && (
                                        <button 
                                            type="button" 
                                            onClick={() => removeProfile(index)}
                                            className="text-red-600 hover:text-red-700"
                                        >
                                            <IconTrash />
                                        </button>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Platform *</label>
                                        <select 
                                            name="platform" 
                                            value={profile.platform} 
                                            onChange={(e) => handleProfileChange(index, e)} 
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                        >
                                            <option value="instagram">Instagram</option>
                                            <option value="tiktok">TikTok</option>
                                            <option value="youtube">YouTube</option>
                                            <option value="facebook">Facebook</option>
                                            <option value="twitter">Twitter</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Username *</label>
                                        <input 
                                            type="text" 
                                            name="username" 
                                            required 
                                            value={profile.username} 
                                            onChange={(e) => handleProfileChange(index, e)} 
                                            placeholder="@username"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Followers Count *</label>
                                        <input 
                                            type="number" 
                                            name="followers" 
                                            required 
                                            value={profile.followers} 
                                            onChange={(e) => handleProfileChange(index, e)} 
                                            placeholder="e.g., 10000"
                                            min="0"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Account Created Date</label>
                                        <input 
                                            type="date" 
                                            name="account_created_date" 
                                            value={profile.account_created_date} 
                                            onChange={(e) => handleProfileChange(index, e)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Total Posts</label>
                                        <input 
                                            type="number" 
                                            name="total_posts" 
                                            value={profile.total_posts} 
                                            onChange={(e) => handleProfileChange(index, e)} 
                                            placeholder="e.g., 500"
                                            min="0"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Total Following</label>
                                        <input 
                                            type="number" 
                                            name="total_following" 
                                            value={profile.total_following} 
                                            onChange={(e) => handleProfileChange(index, e)} 
                                            placeholder="e.g., 200"
                                            min="0"
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        <button 
                            type="button" 
                            onClick={addProfile}
                            className="flex items-center gap-2 text-pink-600 hover:text-pink-700 font-medium"
                        >
                            <IconPlus /> Add Another Profile
                        </button>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Application Guidelines</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• All information provided must be accurate and verifiable</li>
                            <li>• Minimum 1,000 followers on at least one platform</li>
                            <li>• Active account with consistent posting history</li>
                            <li>• Authentic engagement and genuine followers</li>
                            <li>• Professional behavior and brand-safe content</li>
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="flex-1 bg-pink-600 text-white py-3 px-6 rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            {loading ? (
                                <>
                                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Submitting Application...
                                </>
                            ) : (
                                'Submit Application'
                            )}
                        </button>
                        <Link 
                            to="/"
                            className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 text-center font-medium"
                        >
                            Back to Home
                        </Link>
                    </div>
                </form>

                {/* Help Section */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Need Help?</h3>
                    <p className="text-sm text-gray-600">
                        Have questions about the application process? Contact our support team at{' '}
                        <a href="mailto:support@lixus.id" className="text-pink-600 hover:text-pink-700">
                            support@lixus.id
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}