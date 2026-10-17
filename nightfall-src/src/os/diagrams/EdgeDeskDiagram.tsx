import React from 'react';
import { Diagram, DiagramNode, DiagramLink } from './Diagram';

const nodes: DiagramNode[] = [
  {
    id: 'edge_devices',
    label: 'Jetson Nano Fleet',
    sublabel: 'VNC & Systemd Agent',
    x: 40,
    y: 130,
    width: 170,
    height: 70,
    description:
      'Fleet of NVIDIA Jetson Nano edge devices running a systemd background service. Captures framebuffers via VNC and exposes a local agent for lifecycle control and reboot safety.',
  },
  {
    id: 'tls_tunnel',
    label: 'TLS / WSS Channel',
    sublabel: 'Encrypted Transport',
    x: 270,
    y: 130,
    width: 160,
    height: 70,
    description:
      'Encrypted bi-directional WebSocket connection transporting low-latency screen frames, control packets, and telemetry data over TLS.',
  },
  {
    id: 'ws_broker',
    label: 'Custom WS Broker',
    sublabel: 'Python / AsyncIO',
    x: 490,
    y: 130,
    width: 170,
    height: 70,
    description:
      'Central Python WebSocket broker coordinating multi-client routing, session state, connection resilience, and authentication across distributed edge devices.',
  },
  {
    id: 'dashboard',
    label: 'Operator Dashboard',
    sublabel: 'Unified Web UI',
    x: 720,
    y: 130,
    width: 160,
    height: 70,
    description:
      'Central browser-based control plane to manage multiple remote Jetson Nano devices simultaneously from a single unified dashboard interface.',
  },
  {
    id: 'file_channel',
    label: 'File Transfer Engine',
    sublabel: 'Drag-and-Drop Sideband',
    x: 380,
    y: 260,
    width: 180,
    height: 65,
    description:
      'Dedicated encrypted sideband channel for chunked file transfer, checksum verification, and cross-device drag-and-drop capability without degrading frame streaming.',
  },
];

const links: DiagramLink[] = [
  { from: 'edge_devices', to: 'tls_tunnel', label: 'Screen / Telemetry' },
  { from: 'tls_tunnel', to: 'ws_broker', label: 'Encrypted Stream' },
  { from: 'ws_broker', to: 'dashboard', label: 'Remote Control' },
  { from: 'edge_devices', to: 'file_channel', label: 'File I/O', dashed: true },
  { from: 'file_channel', to: 'dashboard', label: 'Drag & Drop', dashed: true },
];

export const EdgeDeskDiagram: React.FC = () => {
  return (
    <Diagram
      title="EdgeDesk System Architecture"
      nodes={nodes}
      links={links}
      width={920}
      height={360}
    />
  );
};
