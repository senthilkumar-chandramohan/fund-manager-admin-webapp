import React from 'react'
import { Menu, X, LogOut, BarChart3, Briefcase, Plus, TrendingUp, Activity, Users, FileText, Settings } from 'lucide-react'
import { menuItems } from '../../common/data'

const Sidebar = ({ sidebarOpen, setSidebarOpen, currentScreen, setCurrentScreen }) => {
  const getIcon = (id) => {
    const iconMap = {
      'dashboard': BarChart3,
      'funds': Briefcase,
      'create-fund': Plus,
      'investments': TrendingUp,
      'workflows': Activity,
      'beneficiaries': Users,
      'reports': FileText,
      'settings': Settings,
    }
    return iconMap[id] || BarChart3
  }

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 z-50`}>
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        {sidebarOpen && <h1 className="text-xl font-bold">PensionAdmin</h1>}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      
      <nav className="p-4">
        {menuItems.map(item => {
          const Icon = getIcon(item.id)
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`w-full flex items-center gap-3 p-3 rounded mb-2 transition-colors ${
                currentScreen === item.id ? 'bg-blue-600' : 'hover:bg-slate-800'
              }`}
            >
              <Icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
        <button className="w-full flex items-center gap-3 p-3 hover:bg-slate-800 rounded">
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar
