import { useState } from 'react'
import { orgChart, type OrgNode } from '@/lib/mock-data'

const deptColors: Record<string, { bg: string; text: string; border: string }> = {
  Dirección: { bg: 'bg-brand-dark', text: 'text-white', border: 'border-brand-dark' },
  Comercial: { bg: 'bg-brand-blue', text: 'text-white', border: 'border-brand-blue' },
  Operaciones: { bg: 'bg-amber-500', text: 'text-white', border: 'border-amber-500' },
  RRHH: { bg: 'bg-emerald-600', text: 'text-white', border: 'border-emerald-600' },
  default: { bg: 'bg-indigo-600', text: 'text-white', border: 'border-indigo-600' },
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('')
}

function NodeCard({
  node,
  isRoot = false,
  isCurrentUser = false,
  onSelect,
}: {
  node: OrgNode
  isRoot?: boolean
  isCurrentUser?: boolean
  onSelect: (n: OrgNode) => void
}) {
  const colors = deptColors[node.department] || deptColors.default

  return (
    <button
      onClick={() => onSelect(node)}
      className={`flex flex-col items-center transition-all active:scale-95 ${isRoot ? 'scale-110' : ''}`}
    >
      <div
        className={`relative rounded-full flex items-center justify-center font-bold shadow-lg border-4 border-white transition-transform ${
          isRoot ? 'w-16 h-16 text-base' : 'w-12 h-12 text-sm'
        } ${colors.bg} ${colors.text} ${isCurrentUser ? 'ring-2 ring-brand-yellow ring-offset-2' : ''}`}
      >
        {getInitials(node.name)}
        {isCurrentUser && (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-brand-yellow rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[10px] text-white" style={{ fontSize: '10px' }}>star</span>
          </div>
        )}
      </div>
      <div className={`mt-1.5 text-center ${isRoot ? 'max-w-[100px]' : 'max-w-[80px]'}`}>
        <p className={`font-bold text-[#213053] leading-tight ${isRoot ? 'text-[11px]' : 'text-[10px]'}`}>
          {node.name.split(' ').slice(0, 2).join(' ')}
        </p>
        <p className="text-[9px] text-on-surface-variant leading-tight mt-0.5 line-clamp-2">
          {node.role}
        </p>
      </div>
    </button>
  )
}

function Level2Group({ parent, onSelect }: { parent: OrgNode; onSelect: (n: OrgNode) => void }) {
  return (
    <div className="flex flex-col items-center">
      <NodeCard node={parent} onSelect={onSelect} isCurrentUser={parent.name === 'ALVARO MENDEZ'} />

      {parent.children && parent.children.length > 0 && (
        <>
          <div className="w-px h-5 bg-gray-300 mt-2" />
          <div className="flex gap-4 items-start">
            {parent.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                <div className="w-px h-4 bg-gray-300" />
                <NodeCard node={child} onSelect={onSelect} isCurrentUser={child.name === 'ALVARO MENDEZ'} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function OrgChartPage() {
  const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null)
  const colors = selectedNode ? (deptColors[selectedNode.department] || deptColors.default) : deptColors.default

  return (
    <div className="flex flex-col min-h-[calc(100dvh-7rem)] px-4 py-4 max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-gray-100/80 shadow-sm p-3 mb-4 flex items-center gap-3 anim-hidden animate-slide-up delay-100">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-indigo-600 text-[20px]">hub</span>
        </div>
        <div>
          <p className="font-semibold text-[#213053] text-sm">Organigrama PeopleNet</p>
          <p className="text-xs text-on-surface-variant">Toca un nodo para ver el detalle</p>
        </div>
        <div className="ml-auto flex items-center gap-1 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[14px]">people</span>
          <span>{1 + (orgChart.children?.length ?? 0) + (orgChart.children?.flatMap(c => c.children ?? []).length ?? 0)}</span>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-auto anim-hidden animate-scale-in delay-150">
        <div className="min-w-[420px] p-6 flex flex-col items-center">
          <NodeCard node={orgChart} isRoot onSelect={setSelectedNode} />
          <div className="w-px h-8 bg-gray-300 mt-3" />
          <div className="relative w-full flex justify-center">
            <div
              className="h-px bg-gray-300 absolute top-0"
              style={{ width: 'calc(100% - 80px)' }}
            />
          </div>
          <div className="flex justify-around w-full mt-0 pt-0">
            {orgChart.children?.map((l2Node) => (
              <div key={l2Node.id} className="flex flex-col items-center">
                <div className="w-px h-5 bg-gray-300" />
                <Level2Group parent={l2Node} onSelect={setSelectedNode} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar pb-0.5 anim-hidden animate-slide-up delay-300">
        {Object.entries(deptColors).filter(([k]) => k !== 'default').map(([dept, c]) => (
          <div key={dept} className="flex-shrink-0 flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border border-gray-100 shadow-sm">
            <div className={`w-2.5 h-2.5 rounded-full ${c.bg}`} />
            <span className="text-[10px] font-semibold text-on-surface-variant">{dept}</span>
          </div>
        ))}
      </div>

      {selectedNode && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedNode(null)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-t-3xl p-6 pb-safe animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

            <div className="flex items-center gap-4 mb-5">
              <div
                className={`w-16 h-16 rounded-2xl ${colors.bg} ${colors.text} flex items-center justify-center text-xl font-bold shadow-lg`}
              >
                {getInitials(selectedNode.name)}
              </div>
              <div>
                <h2 className="font-bold text-[#213053] text-lg leading-tight">{selectedNode.name}</h2>
                <p className="text-on-surface-variant text-sm">{selectedNode.role}</p>
                <span className={`inline-block mt-1 text-[10px] font-bold ${colors.bg} ${colors.text} px-2.5 py-0.5 rounded-full`}>
                  {selectedNode.department}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">mail</span>
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Correo</p>
                  <p className="text-sm text-[#213053] font-medium">
                    {selectedNode.name.toLowerCase().replace(' ', '.').split(' ')[0]}@peoplenet.com
                  </p>
                </div>
              </div>
              {selectedNode.children && selectedNode.children.length > 0 && (
                <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">people</span>
                  <div>
                    <p className="text-[10px] text-on-surface-variant uppercase font-semibold">Reportes directos</p>
                    <p className="text-sm text-[#213053] font-medium">{selectedNode.children.length} personas</p>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="w-full mt-4 py-3 rounded-xl bg-gray-100 text-on-surface-variant font-semibold text-sm active:scale-95 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
