/**
 * @param {boolean} isLogin 
 * @param {function} setIsLogin 
 */
export default function AuthToggle({ isLogin, setIsLogin }) {
  return (
    <div className="flex bg-slate-100 rounded-lg p-1 mb-8">
      <button 
        onClick={() => setIsLogin(true)}
        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
          isLogin 
            ? 'bg-white text-slate-900 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Masuk
      </button>
      <button 
        onClick={() => setIsLogin(false)}
        className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all duration-200 ${
          !isLogin 
            ? 'bg-white text-slate-900 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700'
        }`}
      >
        Daftar Masyarakat
      </button>
    </div>
  );
}