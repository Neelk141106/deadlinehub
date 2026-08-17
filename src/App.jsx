function App() {
  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl text-primary-600">
          DeadlineHub Design System
        </h1>
        <p className="text-gray-500">
          DH-003 — Design System UI Verification
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl border-b pb-2">Typography & Colors</h2>
        <div className="space-y-2">
          <p className="text-gray-900 font-medium">Primary Text (Gray 900)</p>
          <p className="text-gray-500">Secondary Text (Gray 500)</p>
          <p className="text-primary-600 font-medium">Brand Accent (Primary 600)</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl border-b pb-2">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <button className="btn-primary">Primary Button</button>
          <button className="btn-secondary">Secondary Button</button>
          <button className="btn-danger">Danger Button</button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl border-b pb-2">Badges</h2>
        <div className="flex flex-wrap gap-4">
          <span className="badge-urgent">Urgent</span>
          <span className="badge-approaching">Approaching</span>
          <span className="badge-normal">Normal</span>
          <span className="badge-past">Past</span>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl border-b pb-2">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-2">Standard Card</h3>
            <p className="text-sm text-gray-500">This is a standard card with moderate rounded corners, white background, and a light shadow.</p>
          </div>
          <div className="card-hover p-6">
            <h3 className="text-lg font-semibold mb-2">Hover Card</h3>
            <p className="text-sm text-gray-500">This card elevates slightly when hovered, providing interactive feedback.</p>
            <div className="mt-4">
              <button className="btn-primary">Action</button>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl border-b pb-2">Inputs</h2>
        <div className="max-w-md space-y-4">
          <div>
            <label htmlFor="example-input" className="label-text">Email Address</label>
            <input type="email" id="example-input" className="input-field" placeholder="student@college.edu" />
          </div>
        </div>
      </section>
    </div>
  )
}

export default App
