import React, { useState } from 'react';
import { useDeadlines } from '../context/DeadlineContext';

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
};

// ── Reusable form view ────────────────────────────────────────────────────────
function DeadlineForm({ heading, subheading, form, onChange, onSubmit, onCancel, submitLabel, error, minDate }) {
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
                placeholder="Add any details or instructions..."
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

          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800/80 pb-2 mt-6">Target Students</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Branch</label>
                <select name="branch" value={form.branch} onChange={onChange} className="input-field cursor-pointer">
                  <option>Information Technology</option>
                  <option>Computer Science</option>
                  <option>Electronics</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Semester</label>
                <select name="semester" value={form.semester} onChange={onChange} className="input-field cursor-pointer">
                  {['Semester 1','Semester 2','Semester 3','Semester 4','Semester 5','Semester 6','Semester 7','Semester 8'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Division</label>
                <select name="division" value={form.division} onChange={onChange} className="input-field cursor-pointer">
                  <option>All Divisions</option>
                  <option>D15A</option>
                  <option>D15B</option>
                  <option>D15C</option>
                </select>
              </div>
            </div>
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
export function ManageDeadlinesPage() {
  const { deadlines, addDeadline, updateDeadline, deleteDeadline } = useDeadlines();
  const [view, setView] = useState('list'); // 'list' | 'add' | 'edit'
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState(null);

  const todayStr = getTodayDateString();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError(null);
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
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
    setForm({
      ...EMPTY_FORM,
      ...deadline,
      dueDate: dateStr,
      dueTime: deadline.dueTime || '23:59',
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

    try {
      const [yyyy, mm, dd] = form.dueDate.split('-').map(Number);
      const [hours, mins] = (form.dueTime || '23:59').split(':').map(Number);
      const deadlineDate = new Date(yyyy, mm - 1, dd, hours, mins, 0);

      await addDeadline({
        ...form,
        dueDate: deadlineDate.toISOString(),
      });
      setView('list');
      setFormError(null);
    } catch (err) {
      setFormError(err.message || 'Failed to save deadline');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!form.dueDate) {
      setFormError('Please select a due date.');
      return;
    }
    if (form.dueDate < todayStr) {
      setFormError('Due date cannot be in the past. Please select today or a future date.');
      return;
    }

    try {
      const [yyyy, mm, dd] = form.dueDate.split('-').map(Number);
      const [hours, mins] = (form.dueTime || '23:59').split(':').map(Number);
      const deadlineDate = new Date(yyyy, mm - 1, dd, hours, mins, 0);

      await updateDeadline(editingId, {
        ...form,
        dueDate: deadlineDate.toISOString(),
      });
      setView('list');
      setEditingId(null);
      setFormError(null);
    } catch (err) {
      setFormError(err.message || 'Failed to update deadline');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDeadline(id);
    } catch (err) {
      console.error('Delete deadline error:', err);
    }
  };

  // ── Form views ──
  if (view === 'add') {
    return (
      <DeadlineForm
        heading="Add Deadline"
        subheading="Create a new academic deadline reminder."
        form={form}
        onChange={handleChange}
        onSubmit={handleAdd}
        onCancel={handleCancel}
        submitLabel="Save Deadline"
        error={formError}
        minDate={todayStr}
      />
    );
  }

  if (view === 'edit') {
    return (
      <DeadlineForm
        heading="Edit Deadline"
        subheading="Update this deadline's details."
        form={form}
        onChange={handleChange}
        onSubmit={handleEdit}
        onCancel={handleCancel}
        submitLabel="Update Deadline"
        error={formError}
        minDate={todayStr}
      />
    );
  }

  // ── List view ──
  const formatDue = (d) => {
    if (!d.dueDate) return '—';
    const date = new Date(d.dueDate);
    if (isNaN(date.getTime())) return '—';
    const datePart = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    
    let timePart = '';
    if (d.dueTime && d.dueTime.includes(':')) {
      const [hours, minutes] = d.dueTime.split(':');
      const dummyDate = new Date();
      dummyDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      timePart = dummyDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else {
      timePart = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return `${datePart} • ${timePart}`;
  };

  const formatTarget = (d) =>
    [d.branch?.split(' ').map(w => w[0]).join(''), d.semester, d.division]
      .filter(Boolean)
      .join(' • ');

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Manage Deadlines</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Create and manage academic deadline reminders.</p>
        </div>
        <button
          onClick={openAdd}
          className="btn-primary gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="12"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Deadline
        </button>
      </div>

      {deadlines.length === 0 ? (
        <div className="card p-12 text-center border-dashed border-slate-300 dark:border-slate-800">
          <p className="text-slate-500 dark:text-slate-400">No deadlines yet. Click <strong className="text-slate-900 dark:text-slate-100">Add Deadline</strong> to create one.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="p-4">Subject &amp; Title</th>
                  <th className="p-4">Type &amp; Priority</th>
                  <th className="p-4">Due Date</th>
                  <th className="p-4">Target</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {deadlines.map((deadline) => (
                  <tr key={deadline.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group">
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
                      <p className="text-sm text-slate-600 dark:text-slate-400">{formatTarget(deadline)}</p>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(deadline)} className="p-1.5 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/50 rounded-lg transition-colors cursor-pointer" title="Edit">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                        </button>
                        <button onClick={() => handleDelete(deadline.id)} className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-colors cursor-pointer" title="Delete">
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
      )}
    </div>
  );
}
