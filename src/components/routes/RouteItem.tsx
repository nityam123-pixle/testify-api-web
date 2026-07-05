import { Route } from '@/lib/types'
import { METHOD_COLORS } from '@/lib/constants'
import { useWorkspaceStore } from '@/store/workspace'

interface RouteItemProps {
  route: Route
}

export function RouteItem({ route }: RouteItemProps) {
  const { selectedRoute, setSelectedRoute } = useWorkspaceStore()
  const isSelected = selectedRoute?.path === route.path && selectedRoute?.method === route.method

  const methodColorClass = METHOD_COLORS[route.method as keyof typeof METHOD_COLORS] || METHOD_COLORS.ALL

  return (
    <button
      onClick={() => setSelectedRoute(route)}
      className={`w-full flex items-center gap-3 px-3 py-3 mt-0.5 text-sm text-left transition-all duration-200 border-l-[3px] rounded-r-md ${
        isSelected 
          ? 'bg-surface-2 border-primary text-foreground font-semibold shadow-sm' 
          : 'border-transparent hover:bg-surface-2/50 text-muted-foreground'
      }`}
    >
      <span className={`w-[4.5rem] shrink-0 text-center rounded-full py-0.5 text-[10px] font-mono font-bold tracking-wider opacity-90 ${methodColorClass} ${isSelected ? 'opacity-100 shadow-sm' : 'group-hover:opacity-100'}`}>
        {route.method.toUpperCase()}
      </span>
      <span className="truncate font-mono text-xs tracking-wide" title={route.path}>
        {route.path}
      </span>
    </button>
  )
}
