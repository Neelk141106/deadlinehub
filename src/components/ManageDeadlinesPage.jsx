import React, { useState, useMemo } from 'react';
import { useDeadlines } from '../context/DeadlineContext';
import { useClasses } from '../context/ClassContext';

const getTodayDateString = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const EMPTY_FORM = {
  subject: '',
  title: '',
  description: '',
  type: 'Assignment',
  priority: 'Normal',
  dueDate: '',
  dueTime: '23:59',
  branch: 'Information Technology',
  semester: 'Semester 5',
  division: 'All Divisions',
  targetType: 'all_classes', // 'all_classes' | 'particular_classes'
  targetClassIds: [],
};

// ── Reusable form view ────────────────────────────────────────────────────────
function DeadlineForm({
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
  minDate,
  submitting = false,
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

      <div className="card p-4 sm:p-6 md:p-8">
        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/80 pb-2">Basic Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={onChange}
                  className="input-field"
                  placeholder="e.g., Full Stack Development"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  className="input-field"
                  placeholder="e.g., Assignment 1"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                className="input-field min-h-[100px]"
                placeholder="Add any details, submission instructions or links..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
                <select name="type" value={form.type} onChange={onChange} className="input-field cursor-pointer">
                  <option>Assignment</option>
                  <option>Practical</option>
                  <option>Experiment</option>
                  <option>Quiz</option>
                  <option>Exam</option>
                  <option>Viva</option>
                  <option>Project</option>
                  <option>Registration</option>
                  <option>Other</option>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  min={minDate}
                  value={form.dueDate}
                  onChange={onChange}
                  className="input-field"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Due Time</label>
                <input
                  type="time"
                  name="dueTime"
                  value={form.dueTime}
                  onChange={onChange}
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* ── Deadline Targeting Section ──────────────────────────────── */}
          <div className="space-y-4 pt-2">
            <div className="border-b border-slate-100 dark:border-slate-800/80 pb-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Target Classes</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Specify which of your classes should receive this deadline reminder.
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
                  id="target-all-classes"
                  name="targetType"
                  value="all_classes"
                  checked={form.targetType === 'all_classes'}
                  onChange={() => onTargetTypeChange('all_classes')}
                  className="mt-1 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <div>
                  <label htmlFor="target-all-classes" className="text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer block">
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
                  id="target-particular-classes"
                  name="targetType"
                  value="particular_classes"
                  checked={form.targetType === 'particular_classes'}
                  onChange={() => onTargetTypeChange('particular_classes')}
                  className="mt-1 text-primary-600 focus:ring-primary-500 cursor-pointer"
                />
                <div>
                  <label htmlFor="target-particular-classes" className="text-sm font-bold text-slate-900 dark:text-slate-100 cursor-pointer block">
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
            <button type="button" onClick={onCancel} disabled={submitting} className="btn-secondary cursor-pointer disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary gap-2 cursor-pointer disabled:opacity-50">
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  <span>{submitLabel}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ManageDeadlinesPage() {
  const { deadlines, addDeadline, updateDeadline, deleteDeadline } = useDeadlines();
  const { classes } = useClasses();

  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const uniqueDeadlines = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const d of (deadlines || [])) {
      const id = (d?._id || d?.id || '')?.toString();
      if (id && !seen.has(id)) {
        seen.add(id);
        result.push(d);
      } else if (!id) {
        result.push(d);
      }
    }
    return result;
  }, [deadlines]);

  const todayStr = getTodayDateString();

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

  const openEdit = (deadline) => {
    setEditingId(deadline.id || deadline._id);
    let dateStr = '';
    if (deadline.dueDate) {
      const d = new Date(deadline.dueDate);
      if (!isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        dateStr = `${yyyy}-${mm}-${dd}`;
      } else if (typeof deadline.dueDate === 'string') {
        dateStr = deadline.dueDate.includes('T') ? deadline.dueDate.split('T')[0] : deadline.dueDate;
      }
    }

    let initialTargetIds = [];
    if (Array.isArray(deadline.targetClassIds) && deadline.targetClassIds.length > 0) {
      initialTargetIds = deadline.targetClassIds.map((c) => (c._id ? c._id.toString() : c.toString()));
    } else if (deadline.classId) {
      initialTargetIds = [deadline.classId._id ? deadline.classId._id.toString() : deadline.classId.toString()];
    }

    const targetType = deadline.targetType || (initialTargetIds.length > 0 && initialTargetIds.length < classes.length ? 'particular_classes' : 'all_classes');

    setForm({
      ...EMPTY_FORM,
      ...deadline,
      dueDate: dateStr,
      dueTime: deadline.dueTime || '23:59',
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
    if (!form.dueDate) {
      setFormError('Please select a due date.');
      return;
    }
    if (form.dueDate < todayStr) {
      setFormError('Due date cannot be in the past. Please select today or a future date.');
      return;
    }

    if (form.targetType === 'particular_classes' && form.targetClassIds.length === 0) {
      setFormError('Please select at least one class to target.');
      return;
    }

    setSubmitting(true);
    try {
      const [yyyy, mm, dd] = form.dueDate.split('-').map(Number);
      const [hours, mins] = (form.dueTime || '23:59').split(':').map(Number);
      const deadlineDate = new Date(yyyy, mm - 1, dd, hours, mins, 0);

      const targetClassIds =
        form.targetType === 'all_classes'
          ? classes.map((c) => c._id)
          : form.targetClassIds;

      await addDeadline({
        ...form,
        dueDate: deadlineDate.toISOString(),
        targetType: form.targetType,
        targetClassIds,
      });
      setView('list');
      setForm(EMPTY_FORM);
      setFormError(null);
    } catch (err) {
      setFormError(err.message || 'Failed to create deadline.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.dueDate) {
      setFormError('Please select a due date.');
      return;
    }

    if (form.targetType === 'particular_classes' && form.targetClassIds.length === 0) {
      setFormError('Please select at least one class to target.');
      return;
    }

    setSubmitting(true);
    try {
      const [yyyy, mm, dd] = form.dueDate.split('-').map(Number);
      const [hours, mins] = (form.dueTime || '23:59').split(':').map(Number);
      const deadlineDate = new Date(yyyy, mm - 1, dd, hours, mins, 0);

      const targetClassIds =
        form.targetType === 'all_classes'
          ? classes.map((c) => c._id)
          : form.targetClassIds;

      await updateDeadline(editingId, {
        ...form,
        dueDate: deadlineDate.toISOString(),
        targetType: form.targetType,
        targetClassIds,
      });
      setView('list');
      setEditingId(null);
      setForm(EMPTY_FORM);
      setFormError(null);
    } catch (err) {
      setFormError(err.message || 'Failed to update deadline.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deadline?')) return;
    try {
      await deleteDeadline(id);
    } catch (err) {
      alert(err.message || 'Failed to delete deadline.');
    }
  };

  if (view === 'add') {
    return (
      <DeadlineForm
        heading="Add New Deadline"
        subheading="Publish a deadline reminder for your classes."
        form={form}
        classes={classes}
        onChange={handleChange}
        onTargetTypeChange={handleTargetTypeChange}
        onClassToggle={handleClassToggle}
        onSelectAllClasses={handleSelectAllClasses}
        onSubmit={handleAdd}
        onCancel={handleCancel}
        submitLabel="Publish Deadline"
        error={formError}
        minDate={todayStr}
        submitting={submitting}
      />
    );
  }

  if (view === 'edit') {
    return (
      <DeadlineForm
        heading="Edit Deadline"
        subheading="Update the details or class targeting for this deadline."
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
        submitting={submitting}
      />
    );
  }

  const formatDue = (d) => {
    const date = new Date(d.dueDate);
    if (isNaN(date.getTime())) return d.dueDate;
    const datePart = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    let timePart = d.dueTime;
    if (!timePart && date.getHours()) {
      timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return `${datePart} • ${timePart || '23:59'}`;
  };

  const renderTargetBadge = (d) => {
    if (d.targetType === 'all_classes') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/60 text-primary-700 dark:text-primary-300 border border-primary-200/60 dark:border-primary-900/40">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
          All My Classes
        </span>
      );
    }

    const count = Array.isArray(d.targetClassIds) ? d.targetClassIds.length : (d.classId ? 1 : 0);
    let classNames = '';
    if (Array.isArray(d.targetClassIds) && d.targetClassIds.length > 0) {
      classNames = d.targetClassIds
        .map((c) => (c.classCode || c.className || 'Class'))
        .slice(0, 2)
        .join(', ');
      if (d.targetClassIds.length > 2) classNames += ` +${d.targetClassIds.length - 2}`;
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Manage Deadlines</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Create and target academic deadlines to all your classes or selected classes.</p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary gap-2 shrink-0 cursor-pointer shadow-sm hover:shadow"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Deadline
        </button>
      </div>

      {uniqueDeadlines.length === 0 ? (
        <div className="card p-12 text-center border-dashed border-slate-300 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">No deadlines created yet. Click <strong className="text-slate-900 dark:text-slate-100">Add Deadline</strong> to publish one.</p>
        </div>
      ) : (
        <>
          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {uniqueDeadlines.map((deadline) => (
              <div key={deadline.id || deadline._id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{deadline.subject}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{deadline.title}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => openEdit(deadline)} className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 rounded-lg transition-colors cursor-pointer" title="Edit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button onClick={() => handleDelete(deadline.id || deadline._id)} className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer" title="Delete">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge-past text-[11px]">{deadline.type}</span>
                  <span className={`badge ${
                    deadline.priority === 'Urgent'    ? 'badge-urgent' :
                    deadline.priority === 'Important' ? 'badge-approaching' :
                    'badge-normal'
                  } text-[11px]`}>{deadline.priority}</span>
                  {renderTargetBadge(deadline)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Due:</span> {formatDue(deadline)}
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
                    <th className="p-4">Subject &amp; Title</th>
                    <th className="p-4">Type &amp; Priority</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Targeting</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                  {uniqueDeadlines.map((deadline) => (
                    <tr key={deadline.id || deadline._id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
                      <td className="p-4">
                        <p className="font-bold text-slate-900 dark:text-slate-100">{deadline.subject}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{deadline.title}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="badge-past text-[11px]">{deadline.type}</span>
                          <span className={`badge ${
                            deadline.priority === 'Urgent'    ? 'badge-urgent' :
                            deadline.priority === 'Important' ? 'badge-approaching' :
                            'badge-normal'
                          } text-[11px]`}>{deadline.priority}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{formatDue(deadline).split(' • ')[0]}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatDue(deadline).split(' • ')[1]}</p>
                      </td>
                      <td className="p-4">
                        {renderTargetBadge(deadline)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEdit(deadline)} className="p-1.5 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 rounded-lg transition-colors cursor-pointer" title="Edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                          </button>
                          <button onClick={() => handleDelete(deadline.id || deadline._id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer" title="Delete">
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

export default ManageDeadlinesPage;
