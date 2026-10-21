import React from 'react';
import { Diagram, DiagramNode, DiagramLink } from './Diagram';

// Simplified architecture. Every node is taken from the CV description of EdgeDesk — nothing beyond it.
const nodes: DiagramNode[] = [
  {
    id: 'edge_devices',
    label: 'Jetson Nano Devices',
    sublabel: 'VNC · Linux services',
    x: 40,
    y: 130,
    width: 170,
    height: 70,
    description:
      'A fleet of NVIDIA Jetson Nano edge devices. Each exposes its screen over VNC and runs reboot-safe Linux services.',
  },
  {
    id: 'tls_tunnel',
    label: 'TLS / WSS Channel',
    sublabel: 'Encrypted Transport',
    x: 270,
    y: 130,
    width: 160,
    height: 70,
    description: 'Encrypted WebSocket (WSS) transport between the edge devices and the broker.',
  },
  {
    id: 'ws_broker',
    label: 'Custom WS Broker',
    sublabel: 'Python',
    x: 490,
    y: 130,
    width: 170,
    height: 70,
    description: 'Custom Python WebSocket broker that connects the edge devices to the dashboard.',
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    sublabel: 'Multi-device control',
    x: 720,
    y: 130,
    width: 160,
    height: 70,
    description: 'A single dashboard used to manage multiple edge devices — encrypted screen access and file transfer.',
  },
  {
    id: 'file_channel',
    label: 'Encrypted File Transfer',
    sublabel: 'Cross-device drag-and-drop',
    x: 380,
    y: 260,
    width: 200,
    height: 65,
    description: 'Encrypted file transfer between devices, with cross-device drag-and-drop.',
  },
];

const links: DiagramLink[] = [
  { from: 'edge_devices', to: 'tls_tunnel', label: 'Screen' },
  { from: 'tls_tunnel', to: 'ws_broker', label: 'Encrypted' },
  { from: 'ws_broker', to: 'dashboard', label: 'Control' },
  { from: 'edge_devices', to: 'file_channel', label: 'Files', dashed: true },
  { from: 'file_channel', to: 'dashboard', label: 'Drag & drop', dashed: true },
];

export const EdgeDeskDiagram: React.FC = () => {
  return (
    <Diagram
      title="EdgeDesk — Simplified Architecture"
      nodes={nodes}
      links={links}
      width={920}
      height={360}
    />
  );
};
