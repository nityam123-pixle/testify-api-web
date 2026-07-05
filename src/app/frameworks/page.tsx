'use client'

import React, { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Topbar } from '@/components/layout/Topbar'
import { FRAMEWORK_GROUPS, Framework, LanguageGroup } from '@/lib/frameworks'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, CheckCircle2, CircleDashed, Search, Telescope, Boxes, FileCode2, Globe, Target } from 'lucide-react'
import { Input } from '@/components/ui/input'

type StatusFilter = 'All' | 'VERIFIED' | 'PATTERN' | 'EXPERIMENTAL' | 'COMING SOON'

const STATS = [
  { label: 'Supported Frameworks', value: '45+', icon: Boxes, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Detection Patterns', value: '180+', icon: FileCode2, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  { label: 'Languages', value: '12', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Detection Accuracy', value: '95%', icon: Target, color: 'text-purple-500', bg: 'bg-purple-500/10' },
]

const STATUS_FILTERS: StatusFilter[] = ['All', 'VERIFIED', 'PATTERN', 'EXPERIMENTAL', 'COMING SOON']

export default function FrameworksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Memoized filtering
  const filteredGroups = useMemo(() => {
    const query = searchQuery.toLowerCase().trim()
    
    return FRAMEWORK_GROUPS.map((group) => {
      const filteredFrameworks = group.frameworks.filter((fw) => {
        const matchesSearch = fw.name.toLowerCase().includes(query) || fw.description.toLowerCase().includes(query)
        const matchesStatus = statusFilter === 'All' || fw.status === statusFilter
        return matchesSearch && matchesStatus
      })
      
      return {
        ...group,
        frameworks: filteredFrameworks
      }
    }).filter((group) => group.frameworks.length > 0)
  }, [searchQuery, statusFilter])

  const totalFiltered = filteredGroups.reduce((acc, group) => acc + group.frameworks.length, 0)

  // Wait until mounted to render animations properly (prevents hydration mismatch)
  if (!mounted) return null

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans">
      <Topbar />

      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          
          {/* Header */}
          <div className="mb-12">
            <Link 
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to workspace
            </Link>
            
            <h1 className="text-5xl font-bold tracking-tight mb-4 text-white">Supported Frameworks</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Testify automatically detects your technology stack and scans API routes across modern backend frameworks.
            </p>
          </div>

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
          >
            {STATS.map((stat, idx) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="relative overflow-hidden rounded-xl border border-border/50 bg-muted/5 p-5 transition-all hover:border-border hover:shadow-lg hover:shadow-black/20"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className={`p-2.5 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <h2 className="text-3xl font-bold text-white">{stat.value}</h2>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12 sticky top-0 bg-background/80 backdrop-blur-xl z-20 py-4 border-b border-border/30">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search frameworks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 bg-muted/10 border-border/50 rounded-full focus-visible:ring-1 focus-visible:ring-border h-10"
              />
            </div>
            
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
              {STATUS_FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`relative px-4 py-1.5 text-sm font-medium rounded-full transition-colors whitespace-nowrap
                    ${statusFilter === filter ? 'text-white' : 'text-muted-foreground hover:text-white'}
                  `}
                >
                  {statusFilter === filter && (
                    <motion.div
                      layoutId="activeFilter"
                      className="absolute inset-0 bg-white/10 rounded-full border border-white/20"
                      initial={false}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">
                    {filter === 'All' ? 'All' : filter.charAt(0) + filter.slice(1).toLowerCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout */}
          <div className="space-y-16 min-h-[500px]">
            <AnimatePresence mode="wait">
              {totalFiltered === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center py-32 text-center"
                >
                  <div className="h-20 w-20 rounded-full bg-muted/10 flex items-center justify-center mb-6">
                    <Telescope className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">No matching frameworks</h3>
                  <p className="text-muted-foreground">Try adjusting your search or filters.</p>
                </motion.div>
              ) : (
                filteredGroups.map((group, groupIdx) => (
                  <motion.section 
                    key={group.language}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: groupIdx * 0.1 }}
                  >
                    <div className="flex items-center gap-4 mb-8">
                      <h2 className="text-2xl font-bold text-white whitespace-nowrap">
                        {group.language}
                      </h2>
                      <span className="text-sm font-medium text-muted-foreground px-2 py-0.5 rounded-full bg-muted/10">
                        {group.frameworks.length} Frameworks
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-border/50 to-transparent" />
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {group.frameworks.map((fw, fwIdx) => (
                        <FrameworkCard key={fw.name} fw={fw} index={fwIdx} />
                      ))}
                    </div>
                  </motion.section>
                ))
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </main>
    </div>
  )
}

function FrameworkCard({ fw, index }: { fw: Framework, index: number }) {
  const [imgError, setImgError] = useState(false)

  const isPattern = fw.status === 'PATTERN'
  const hoverClasses = isPattern 
    ? 'hover:border-primary/50 hover:shadow-primary/10' 
    : 'hover:border-emerald-500/50 hover:shadow-emerald-500/10'
  
  const glowClasses = isPattern 
    ? 'from-primary/0' 
    : 'from-emerald-500/0'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -6, scale: 1.02 }}
      className={`group relative flex flex-col h-full rounded-xl bg-card border border-border/40 p-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.5)] cursor-pointer overflow-hidden ${hoverClasses}`}
    >
      {/* Background Hover Glow */}
      <div className={`absolute inset-0 bg-gradient-to-b via-transparent to-transparent opacity-0 group-hover:opacity-10 transition-opacity duration-500 ${glowClasses}`} />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
            {!imgError ? (
              <img 
                src={fw.icon} 
                alt={fw.name} 
                className="h-6 w-6 object-contain opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                onError={() => setImgError(true)}
              />
            ) : (
              <Boxes className={`h-5 w-5 text-muted-foreground transition-colors ${isPattern ? 'group-hover:text-primary' : 'group-hover:text-emerald-400'}`} />
            )}
          </div>
          <StatusBadge status={fw.status} />
        </div>
        
        <div className="mt-auto">
          <h3 className="text-lg font-semibold text-white mb-1 transition-colors">{fw.name}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 group-hover:text-muted-foreground/80 transition-colors">
            {fw.description}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function StatusBadge({ status }: { status: Framework['status'] }) {
  switch (status) {
    case 'VERIFIED':
      return (
        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
          <CheckCircle2 className="h-3 w-3 mr-1.5" />
          Verified
        </Badge>
      )
    case 'PATTERN':
      return (
        <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
          <CircleDashed className="h-3 w-3 mr-1.5" />
          Pattern
        </Badge>
      )
    case 'EXPERIMENTAL':
      return (
        <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
          <CircleDashed className="h-3 w-3 mr-1.5" />
          Experimental
        </Badge>
      )
    case 'COMING SOON':
      return (
        <Badge variant="secondary" className="bg-gray-500/10 text-gray-400 border border-gray-500/20 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
          <CircleDashed className="h-3 w-3 mr-1.5" />
          Coming Soon
        </Badge>
      )
  }
}
