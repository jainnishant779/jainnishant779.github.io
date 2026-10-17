import React, { useState } from 'react';

export interface DiagramNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  description: string;
}

export interface DiagramLink {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

interface DiagramProps {
  title: string;
  nodes: DiagramNode[];
  links: DiagramLink[];
  width?: number;
  height?: number;
}

export const Diagram: React.FC<DiagramProps> = ({
  title,
  nodes,
  links,
  width = 800,
  height = 360,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(nodes[0]?.id || '');

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0];

  const getNodeCenter = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    if (!node) return { x: 0, y: 0 };
    return {
      x: node.x + node.width / 2,
      y: node.y + node.height / 2,
    };
  };

  return (
    <div className="architecture-container">
      <div className="diagram-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="diagram-svg"
          role="img"
          aria-label={title}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#e8a23a" />
            </marker>
            <marker
              id="arrowhead-dim"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#6b675d" />
            </marker>
          </defs>

          {/* Links / Connectors */}
          {links.map((link, idx) => {
            const start = getNodeCenter(link.from);
            const end = getNodeCenter(link.to);
            const isHighlighted =
              selectedNodeId === link.from || selectedNodeId === link.to;

            return (
              <g key={`link-${idx}`}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={isHighlighted ? '#e8a23a' : '#2a3038'}
                  strokeWidth={isHighlighted ? 2 : 1.5}
                  strokeDasharray={link.dashed ? '4,4' : undefined}
                  markerEnd={isHighlighted ? 'url(#arrowhead)' : 'url(#arrowhead-dim)'}
                />
                {link.label && (
                  <text
                    x={(start.x + end.x) / 2}
                    y={(start.y + end.y) / 2 - 8}
                    fill="#9e9a8e"
                    fontSize="10"
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                  >
                    {link.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = node.id === selectedNodeId;
            return (
              <g
                key={node.id}
                className={`diagram-node ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedNodeId(node.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedNodeId(node.id);
                  }
                }}
                aria-pressed={isSelected}
              >
                <rect
                  x={node.x}
                  y={node.y}
                  width={node.width}
                  height={node.height}
                  rx={4}
                  fill={isSelected ? '#151a1f' : '#0d1116'}
                  stroke={isSelected ? '#e8a23a' : '#1e2228'}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <text
                  x={node.x + node.width / 2}
                  y={node.y + (node.sublabel ? node.height / 2 - 4 : node.height / 2 + 4)}
                  fill={isSelected ? '#e6e2d8' : '#c5c0b5'}
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="Space Grotesk, sans-serif"
                  textAnchor="middle"
                >
                  {node.label}
                </text>
                {node.sublabel && (
                  <text
                    x={node.x + node.width / 2}
                    y={node.y + node.height / 2 + 14}
                    fill={isSelected ? '#e8a23a' : '#7fb38a'}
                    fontSize="9.5"
                    fontFamily="JetBrains Mono, monospace"
                    textAnchor="middle"
                  >
                    {node.sublabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {selectedNode && (
          <div className="node-desc-panel">
            <div className="node-desc-title">
              ▸ {selectedNode.label} {selectedNode.sublabel ? `[${selectedNode.sublabel}]` : ''}
            </div>
            <p className="node-desc-text">{selectedNode.description}</p>
          </div>
        )}
      </div>
    </div>
  );
};
