function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          DeadlineHub
        </h1>
        <p className="max-w-md mx-auto text-base text-slate-400 sm:text-lg md:text-xl">
          A centralized academic deadline and announcement platform.
        </p>
        <div className="inline-flex rounded-md shadow">
          <span className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-slate-900 bg-purple-400 hover:bg-purple-300">
            Tailwind CSS Verified
          </span>
        </div>
      </div>
    </div>
  )
}

export default App
