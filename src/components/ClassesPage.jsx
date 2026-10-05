import React, { useState } from 'react';
import { useClasses } from '../context/ClassContext';
import { useAuth } from '../context/AuthContext';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export function ClassesPage() {
  const { classes, loading, error, createClass, deleteClass } = useClasses();
  const { user } = useAuth();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClassForStudents, setSelectedClassForStudents] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    className: '',
    subject: '',
    semester: 'Semester 5',
    division: 'D15C',
    classCode: '',
  });

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setActionError('');
    if (!formData.className.trim()) {
      setActionError('Class Name is required');
      return;
    }

    setSubmitting(true);
    try {
      await createClass(formData);
      setFormData({
        className: '',
        subject: '',
        semester: 'Semester 5',
        division: 'D15C',
        classCode: '',
      });
      setShowCreateModal(false);
    } catch (err) {
      setActionError(err.message || 'Failed to create class');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    try {
      await deleteClass(classId);
      setDeleteConfirmId(null);
    } catch (err) {
      alert(`Could not delete class: ${err.message}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Manage Classes
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
            Create classes, share unique class codes with students, and monitor enrollments.
          </p>
        </div>

        <button
          onClick={() => {
            setActionError('');
            setShowCreateModal(true);
          }}
          className="btn-primary inline-flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create New Class
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {/* Classes Grid */}
      {loading && classes.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading your classes...</p>
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-[#151C2C] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mx-auto mb-4 border border-primary-100 dark:border-primary-900/40">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">No classes created yet</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-5">
            Click &ldquo;Create New Class&rdquo; to generate a unique class code and start enrolling students.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary inline-flex items-center gap-2 cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Your First Class
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => {
            const studentCount = cls.students ? cls.students.length : 0;
            const isDeleting = deleteConfirmId === cls._id;

            return (
              <div
                key={cls._id}
                className="bg-white dark:bg-[#151C2C] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                {/* Header banner */}
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {cls.division || 'All Divisions'} • {cls.semester || 'Semester 5'}
                    </span>
                    <span className="bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-900/40 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      {studentCount} {studentCount === 1 ? 'Student' : 'Students'}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {cls.className}
                  </h2>
                  {cls.subject && (
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {cls.subject}
                    </p>
                  )}
                </div>

                {/* Class Code Box */}
                <div className="px-6 py-2">
                  <div className="bg-slate-50 dark:bg-[#0E1524] rounded-xl p-3.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider block">
                        Class Code
                      </span>
                      <span className="font-mono text-base font-bold text-primary-600 dark:text-primary-400 tracking-wider">
                        {cls.classCode}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopyCode(cls.classCode)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary-500 text-slate-700 dark:text-slate-200 hover:text-primary-600 dark:hover:text-primary-400 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      title="Copy code to share with students"
                    >
                      {copiedCode === cls.classCode ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                          </svg>
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-3 flex flex-col gap-2">
                  <button
                    onClick={() => setSelectedClassForStudents(cls)}
                    className="btn-secondary w-full justify-center gap-2 text-xs font-semibold py-2 cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    View Students ({studentCount})
                  </button>

                  {isDeleting ? (
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => handleDeleteClass(cls._id)}
                        className="flex-1 py-1.5 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(cls._id)}
                      className="text-xs text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors py-1 cursor-pointer text-center"
                    >
                      Delete Class
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Class */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#151C2C] rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Create New Class</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  A unique class code will be automatically generated for your students.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {actionError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-xs font-medium">
                  {actionError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Class Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Information Technology - Div C"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Subject / Course
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Cloud Computing & DevOps"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Division
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. D15C"
                    value={formData.division}
                    onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Semester
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Semester 5"
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Custom Class Code <span className="text-slate-400 font-normal">(optional, auto-generated if left blank)</span>
                </label>
                <Input
                  type="text"
                  placeholder="e.g. D15C-5IT"
                  value={formData.classCode}
                  onChange={(e) => setFormData({ ...formData, classCode: e.target.value.toUpperCase() })}
                  className="font-mono uppercase tracking-wider"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="px-5 py-2 text-sm font-semibold"
                >
                  {submitting ? 'Creating...' : 'Create Class'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: View Enrolled Students */}
      {selectedClassForStudents && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#151C2C] rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {selectedClassForStudents.className}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Class Code: <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{selectedClassForStudents.classCode}</span> • {selectedClassForStudents.students ? selectedClassForStudents.students.length : 0} Enrolled
                </p>
              </div>
              <button
                onClick={() => setSelectedClassForStudents(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {!selectedClassForStudents.students || selectedClassForStudents.students.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No students enrolled yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Share the class code <span className="font-mono font-bold text-primary-600 dark:text-primary-400">{selectedClassForStudents.classCode}</span> with students to let them join.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedClassForStudents.students.map((student, idx) => (
                    <div key={student._id || idx} className="py-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-bold text-xs flex items-center justify-center">
                          {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {student.email}
                          </p>
                        </div>
                      </div>

                      {student.studentCode && (
                        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {student.studentCode}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#0E1524] border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedClassForStudents(null)}
                className="btn-secondary text-xs font-semibold py-2 px-4 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClassesPage;
