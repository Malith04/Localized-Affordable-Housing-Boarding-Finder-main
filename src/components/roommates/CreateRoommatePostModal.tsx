'use client';

import React, { useState } from 'react';
import { RoommatePost } from '@/types/bodima';
import { SRI_LANKAN_UNIVERSITIES } from '@/lib/constants/universities';
import { X, Users, Sparkles, GraduationCap, CheckCircle2 } from 'lucide-react';

interface CreateRoommatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: RoommatePost) => void;
  defaultUniversityId?: string;
}

export const CreateRoommatePostModal: React.FC<CreateRoommatePostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
  defaultUniversityId,
}) => {
  const [studentName, setStudentName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [universityId, setUniversityId] = useState(defaultUniversityId || SRI_LANKAN_UNIVERSITIES[0].id);
  const [faculty, setFaculty] = useState('');
  const [academicYear, setAcademicYear] = useState('1st Year (Freshers)');
  const [budgetPerPerson, setBudgetPerPerson] = useState(12000);
  const [studyHabit, setStudyHabit] = useState('Night Owl 🦉');
  const [preferredLocations, setPreferredLocations] = useState('');
  const [bio, setBio] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !phoneNumber) return;

    const selectedUni = SRI_LANKAN_UNIVERSITIES.find((u) => u.id === universityId) || SRI_LANKAN_UNIVERSITIES[0];
    const locs = preferredLocations
      ? preferredLocations.split(',').map((s) => s.trim()).filter(Boolean)
      : [selectedUni.city];

    const newPost: RoommatePost = {
      id: 'roommate-' + Date.now(),
      student_name: studentName,
      avatar_url:
        gender === 'male'
          ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80'
          : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      gender,
      university_id: selectedUni.id,
      university_name: selectedUni.name,
      faculty: faculty || 'General Faculty',
      academic_year: academicYear,
      budget_per_person: Number(budgetPerPerson),
      preferred_locations: locs,
      target_room_type: 'shared',
      needed_roommates_count: 1,
      lifestyle_tags: ['Non-Smoker', 'Clean & Respectful', 'Team Player'],
      study_habit: studyHabit,
      bio: bio || `Looking for batchmates to share an affordable boarding room or annex near ${selectedUni.shortName}.`,
      phone_number: phoneNumber.startsWith('+') ? phoneNumber : `+94${phoneNumber.replace(/^0/, '')}`,
      is_verified_student: true,
      created_at: new Date().toISOString(),
    };

    onPostCreated(newPost);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Post Roommate & Batchmate Request
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Team up with fellow students to split room & annex rent
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {/* Full Name & Phone Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Your Full Name (නම) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Kasun Perera"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                WhatsApp Number *
              </label>
              <input
                type="tel"
                required
                placeholder="e.g. 0771234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Gender & University Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Gender *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2 px-3 rounded-xl border font-bold transition text-center ${
                    gender === 'male'
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-600 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  Male (පිරිමි)
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2 px-3 rounded-xl border font-bold transition text-center ${
                    gender === 'female'
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-600 dark:text-rose-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  Female (ගැහැණු)
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                University (විශ්වවිද්‍යාලය) *
              </label>
              <select
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium"
              >
                {SRI_LANKAN_UNIVERSITIES.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.shortName} - {u.city}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Faculty & Academic Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Faculty / Department
              </label>
              <input
                type="text"
                placeholder="e.g. Faculty of Engineering / Computing"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium"
              >
                <option value="1st Year (Freshers)">1st Year (Freshers)</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="Final Year / Intern">Final Year / Intern</option>
                <option value="Postgraduate / Master">Postgraduate / Master</option>
              </select>
            </div>
          </div>

          {/* Budget & Study Habit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Max Monthly Budget / Person (LKR)
              </label>
              <input
                type="number"
                min="5000"
                step="500"
                value={budgetPerPerson}
                onChange={(e) => setBudgetPerPerson(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Study Habit & Routine
              </label>
              <select
                value={studyHabit}
                onChange={(e) => setStudyHabit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white font-medium"
              >
                <option value="Night Owl 🦉">Night Owl 🦉 (Late night study)</option>
                <option value="Early Bird 🌅">Early Bird 🌅 (Early morning study)</option>
                <option value="Library Studier 📚">Library Studier 📚 (Quiet & disciplined)</option>
                <option value="Group Coder 💻">Group Coder 💻 (Collaborative projects)</option>
              </select>
            </div>
          </div>

          {/* Preferred Locations */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Preferred Locations / Roads (කැමති ප්‍රදේශ)
            </label>
            <input
              type="text"
              placeholder="e.g. Katubedda, Molpe, Wisdom Road (comma separated)"
              value={preferredLocations}
              onChange={(e) => setPreferredLocations(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              About Yourself & Preferences (කෙටි විස්තරය)
            </label>
            <textarea
              rows={3}
              placeholder="Describe your schedule, cooking habits, and what kind of roommate you are looking for..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white shadow-lg shadow-emerald-600/20 transition-all text-sm flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Bodim Match Profile</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
