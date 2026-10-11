import React, { useState } from 'react';
import { useAnnouncements } from '../context/AnnouncementContext';
import { useClasses } from '../context/ClassContext';
import { useAuth } from '../context/AuthContext';

const EMPTY_FORM = {
  title: '',
  message: '',
  category: 'Academic',
  priority: 'Normal',
  isPinned: false,
  branch: 'Information Technology',
  semester: 'Semester 5',
  division: 'All Divisions',
  targetType: 'all_classes', // 'all_classes' | 'particular_classes'
  targetClassIds: [],
};

// ── Reusable form view ────────────────────────────────────────────────────────
function AnnouncementForm({
  heading,
  subheading,
  form,
  classes,
  onChange,
  onTargetTypeChange,
  onClassToggle,
  onSelectAllClasses,
  onSubmit,
  onCancel,
  submitLabel,
  error,
}) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={onCancel}
          type="button"
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-600 dark:text-slate-400 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{heading}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{subheading}</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-sm rounded-xl flex items-center gap-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>{error}</span>
        </div>
      )}

      <div className="card p-6 sm:p-8">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/80 pb-2">Announcement Details</h2>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={onChange}
                className="input-field"
                placeholder="e.g., Room change for practicals"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
              <textarea
                name="message"
                value={form.message}
                onChange={onChange}
                className="input-field min-h-[120px]"
                placeholder="Write the announcement details here..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
                <select name="category" value={form.category} onChange={onChange} className="input-field cursor-pointer">
                  <option>Academic</option>
                  <option>Examination</option>
                  <option>Lecture</option>
                  <option>Practical</option>
                  <option>Department</option>
                  <option>Event</option>
                  <option>General</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Priority</label>
                <select name="priority" value={form.priority} onChange={onChange} className="input-field cursor-pointer">
                  <option>Normal</option>
                  <option>Important</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="pin-announcement"
                name="isPinned"
                checked={form.isPinned}
                onChange={(e) => onChange({ target: { name: 'isPinned', value: e.target.checked } })}
                className="w-4 h-4 text-primary-600 rounded border-slate-300 dark:border-slate-700 focus:ring-primary-500 cursor-pointer"
              />
              <label htmlFor="pin-announcement" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Pin this announcement to the top
              </label>
            </div>
          </div>

          {/* ── Announcement Targeting Section ───────────────────────────── */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Target Classes</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Specify which of your classes should receive this announcement.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: All My Classes */}
              <div
                onClick={() => onTargetTypeChange('all_classes')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  form.targetType === 'all_classes'
                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/40 ring-1 ring-primary-500 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#151C2C]'
                }`}
              >
                <input
                  type="radio"
                  id="ann-target-all-classes"
                  name="annTargetType"
                  value="all_classes"
                  checked={form.targetType === 'all_classes'}
                  onChange={() => onTargetTypeChange('all_classes')}
                  className="mt-1 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <div>
                  <label htmlFor="ann-target-all-classes" className="text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer block">
                    All My Classes
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Automatically targets all classes you own ({classes.length} {classes.length === 1 ? 'class' : 'classes'}).
                  </p>
                </div>
              </div>

              {/* Option 2: Particular Classes */}
              <div
                onClick={() => onTargetTypeChange('particular_classes')}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  form.targetType === 'particular_classes'
                    ? 'border-primary-500 bg-primary-50/60 dark:bg-primary-950/40 ring-1 ring-primary-500 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-[#151C2C]'
                }`}
              >
                <input
                  type="radio"
                  id="ann-target-particular-classes"
                  name="annTargetType"
                  value="particular_classes"
                  checked={form.targetType === 'particular_classes'}
                  onChange={() => onTargetTypeChange('particular_classes')}
                  className="mt-1 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <div>
                  <label htmlFor="ann-target-particular-classes" className="text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer block">
                    Particular Classes
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Select one or more specific classes from your managed classes.
                  </p>
                </div>
              </div>
            </div>

            {/* If Particular Classes selected: list classes */}
            {form.targetType === 'particular_classes' && (
              <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-[#0E1524] border border-slate-200/80 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Select Target Classes ({form.targetClassIds.length} of {classes.length} selected)
                  </span>
                  {classes.length > 0 && (
                    <button
                      type="button"
                      onClick={onSelectAllClasses}
                      className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                    >
                      {form.targetClassIds.length === classes.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                </div>

                {classes.length === 0 ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 py-2">
                    ⚠️ You haven't created any classes yet. Please create a class first from the "Manage Classes" tab to target particular classes.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {classes.map((cls) => {
                      const isChecked = form.targetClassIds.includes(cls._id);
                      return (
                        <label
                          key={cls._id}
                          className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                            isChecked
                              ? 'bg-white dark:bg-[#151C2C] border-primary-400 dark:border-primary-600 shadow-2xs'
                              : 'bg-white/60 dark:bg-[#151C2C]/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => onClassToggle(cls._id)}
                            className="w-4 h-4 text-primary-600 rounded border-slate-300 dark:border-slate-700 focus:ring-primary-500 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                                {cls.className}
                              </span>
                              <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-1.5 py-0.5 rounded">
                                {cls.classCode}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {cls.subject ? `${cls.subject} • ` : ''}{cls.division || 'All Divisions'} • {cls.semester || 'Semester 5'}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800/80">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ManageAnnouncementsPage() {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement, togglePin } = useAnnouncements();
  const { classes } = useClasses();
  const { user } = useAuth();

  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError(null);
  };

  const handleTargetTypeChange = (targetType) => {
    setForm((prev) => ({
      ...prev,
      targetType,
      targetClassIds: targetType === 'all_classes' ? classes.map((c) => c._id) : prev.targetClassIds,
    }));
    if (formError) setFormError(null);
  };

  const handleClassToggle = (classId) => {
    setForm((prev) => {
      const exists = prev.targetClassIds.includes(classId);
      const nextIds = exists
        ? prev.targetClassIds.filter((id) => id !== classId)
        : [...prev.targetClassIds, classId];
      return { ...prev, targetClassIds: nextIds };
    });
    if (formError) setFormError(null);
  };

  const handleSelectAllClasses = () => {
    setForm((prev) => {
      const allSelected = prev.targetClassIds.length === classes.length;
      return {
        ...prev,
        targetClassIds: allSelected ? [] : classes.map((c) => c._id),
      };
    });
    if (formError) setFormError(null);
  };

  const openAdd = () => {
    setForm({
      ...EMPTY_FORM,
      targetType: 'all_classes',
      targetClassIds: classes.map((c) => c._id),
    });
    setFormError(null);
    setView('add');
  };

  const openEdit = (announcement) => {
    setEditingId(announcement.id || announcement._id);

    let initialTargetIds = [];
    if (Array.isArray(announcement.targetClassIds) && announcement.targetClassIds.length > 0) {
      initialTargetIds = announcement.targetClassIds.map((c) => (c._id ? c._id.toString() : c.toString()));
    } else if (announcement.classId) {
      initialTargetIds = [announcement.classId._id ? announcement.classId._id.toString() : announcement.classId.toString()];
    }

    const targetType = announcement.targetType || (initialTargetIds.length > 0 && initialTargetIds.length < classes.length ? 'particular_classes' : 'all_classes');

    setForm({
      ...EMPTY_FORM,
      ...announcement,
      targetType,
      targetClassIds: initialTargetIds.length > 0 ? initialTargetIds : classes.map((c) => c._id),
    });
    setFormError(null);
    setView('edit');
  };

  const handleCancel = () => {
    setView('list');
    setEditingId(null);
    setFormError(null);
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.title || !form.title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!form.message || !form.message.trim()) {
      setFormError('Message is required');
      return;
    }

    if (form.targetType === 'particular_classes' && form.targetClassIds.length === 0) {
      setFormError('Please select at least one class to target.');
      return;
    }

    const pLower = form.priority ? form.priority.toLowerCase() : 'normal';
    const pUpper = form.priority ? form.priority.toUpperCase() : 'NORMAL';

    try {
      const targetClassIds =
        form.targetType === 'all_classes'
          ? classes.map((c) => c._id)
          : form.targetClassIds;

      await addAnnouncement({
        ...form,
        priorityVariant: pLower,
        priorityText: pUpper,
        postedBy: user?.name || 'Teacher / Admin',
        postedTime: 'Just now',
        postedAt: new Date(),
        targetType: form.targetType,
        targetClassIds,
      });
      setView('list');
      setForm(EMPTY_FORM);
      setFormError(null);
    } catch (err) {
      setFormError(err.message || 'Failed to save announcement');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.title.trim()) {
      setFormError('Title is required');
      return;
    }
    if (!form.message || !form.message.trim()) {
      setFormError('Message is required');
      return;
    }

    if (form.targetType === 'particular_classes' && form.targetClassIds.length === 0) {
      setFormError('Please select at least one class to target.');
      return;
    }

    const pLower = form.priority ? form.priority.toLowerCase() : 'normal';
    const pUpper = form.priority ? form.priority.toUpperCase() : 'NORMAL';

    try {
      const targetClassIds =
        form.targetType === 'all_classes'
          ? classes.map((c) => c._id)
          : form.targetClassIds;

      await updateAnnouncement(editingId, {
        ...form,
        priorityVariant: pLower,
        priorityText: pUpper,
        targetType: form.targetType,
        targetClassIds,
      });
      setView('list');
      setEditingId(null);
      setForm(EMPTY_FORM);
      setFormError(null);
    } catch (err) {
      setFormError(err.message || 'Failed to update announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
    } catch (err) {
      console.error('Delete announcement error:', err);
    }
  };

  const handleTogglePin = async (id) => {
    try {
      await togglePin(id);
    } catch (err) {
      console.error('Toggle pin error:', err);
    }
  };

  if (view === 'add') {
    return (
      <AnnouncementForm
        heading="Add Announcement"
        subheading="Publish a new announcement for your classes."
        form={form}
        classes={classes}
        onChange={handleChange}
        onTargetTypeChange={handleTargetTypeChange}
        onClassToggle={handleClassToggle}
        onSelectAllClasses={handleSelectAllClasses}
        onSubmit={handleAdd}
        onCancel={handleCancel}
        submitLabel="Publish Announcement"
        error={formError}
      />
    );
  }

  if (view === 'edit') {
    return (
      <AnnouncementForm
        heading="Edit Announcement"
        subheading="Update the announcement details or targeting."
        form={form}
        classes={classes}
        onChange={handleChange}
        onTargetTypeChange={handleTargetTypeChange}
        onClassToggle={handleClassToggle}
        onSelectAllClasses={handleSelectAllClasses}
        onSubmit={handleEdit}
        onCancel={handleCancel}
        submitLabel="Save Changes"
        error={formError}
      />
    );
  }

  const renderTargetBadge = (a) => {
    if (a.targetType === 'all_classes') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-900/40">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
          All My Classes
        </span>
      );
    }

    const count = Array.isArray(a.targetClassIds) ? a.targetClassIds.length : (a.classId ? 1 : 0);
    let classNames = '';
    if (Array.isArray(a.targetClassIds) && a.targetClassIds.length > 0) {
      classNames = a.targetClassIds
        .map((c) => (c.classCode || c.className || 'Class'))
        .slice(0, 2)
        .join(', ');
      if (a.targetClassIds.length > 2) classNames += ` +${a.targetClassIds.length - 2}`;
    }

    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        {count > 0 ? `${count} ${count === 1 ? 'Class' : 'Classes'} (${classNames})` : 'All My Classes'}
      </span>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 dark:border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Manage Announcements</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Post and target announcements to all your classes or selected classes.</p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary gap-2 shrink-0 cursor-pointer shadow-sm hover:shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Announcement
        </button>
      </div>

      {announcements.length === 0 ? (
        <div className="card p-12 text-center border-dashed border-slate-300 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">No announcements posted yet. Click <strong className="text-slate-900 dark:text-slate-100">Add Announcement</strong> to post one.</p>
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement.id || announcement._id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{announcement.title}</p>
                      {announcement.isPinned && (
                        <span className="text-[10px] uppercase font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/60 px-1.5 py-0.5 rounded">
                          Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{announcement.message}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleTogglePin(announcement.id || announcement._id)} className="p-2 text-slate-400 hover:text-amber-500 rounded-lg transition-colors cursor-pointer" title={announcement.isPinned ? 'Unpin' : 'Pin'}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={announcement.isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
                    </button>
                    <button onClick={() => openEdit(announcement)} className="p-2 text-slate-400 hover:text-primary-600 rounded-lg transition-colors cursor-pointer" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button onClick={() => handleDelete(announcement.id || announcement._id)} className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer" title="Delete">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge-past text-[11px]">{announcement.category}</span>
                  <span className={`badge ${
                    announcement.priority === 'Urgent'    ? 'badge-urgent' :
                    announcement.priority === 'Important' ? 'badge-approaching' :
                    'badge-normal'
                  } text-[11px]`}>{announcement.priority}</span>
                  {renderTargetBadge(announcement)}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="card overflow-hidden hidden sm:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="p-4">Title &amp; Message</th>
                    <th className="p-4">Category &amp; Priority</th>
                    <th className="p-4">Targeting</th>
                    <th className="p-4">Posted</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {announcements.map((announcement) => (
                    <tr key={announcement.id || announcement._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                      <td className="p-4 max-w-sm">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900 dark:text-slate-100">{announcement.title}</p>
                          {announcement.isPinned && (
                            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-900/40 px-1.5 py-0.5 rounded-md">
                              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
                              Pinned
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{announcement.message}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="badge-past text-[11px]">{announcement.category}</span>
                          <span className={`badge ${
                            announcement.priority === 'Urgent'    ? 'badge-urgent' :
                            announcement.priority === 'Important' ? 'badge-approaching' :
                            'badge-normal'
                          } text-[11px]`}>{announcement.priority}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {renderTargetBadge(announcement)}
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-500 dark:text-slate-400">{announcement.postedTime || 'Just now'}</p>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleTogglePin(announcement.id || announcement._id)} className="p-1.5 text-slate-400 hover:text-amber-500 rounded-lg transition-colors cursor-pointer" title={announcement.isPinned ? 'Unpin' : 'Pin'}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill={announcement.isPinned ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z"/></svg>
                          </button>
                          <button onClick={() => openEdit(announcement)} className="p-1.5 text-slate-400 hover:text-primary-600 rounded-lg transition-colors cursor-pointer" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </button>
                          <button onClick={() => handleDelete(announcement.id || announcement._id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer" title="Delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ManageAnnouncementsPage;
