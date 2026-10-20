import React from 'react';
import { Diagram, DiagramNode, DiagramLink } from './Diagram';

const nodes: DiagramNode[] = [
  {
    id: 'junction_a',
    label: 'Junction Node A',
    sublabel: 'ESP32 Controller',
    x: 40,
    y: 130,
    width: 170,
    height: 70,
    description:
      'Autonomous ESP32 microcontroller mounted at traffic intersection A. Samples local queue density and broadcasts vehicle load telemetry via sub-GHz radio without internet connectivity.',
  },
  {
    id: 'lora_gossip',
    label: 'Sub-GHz LoRa Mesh',
    sublabel: 'Ad-Hoc Gossip Protocol',
    x: 270,
    y: 130,
    width: 170,
    height: 70,
    description:
      '868/915 MHz sub-GHz peer-to-peer radio mesh. Employs randomized slotted ALOHA channel backoff to eliminate packet collisions in urban concrete canyons.',
  },
  {
    id: 'junction_b',
    label: 'Junction Node B',
    sublabel: 'ESP32 Coordinator',
    x: 500,
    y: 130,
    width: 170,
    height: 70,
    description:
      'Neighboring intersection node receiving gossip broadcast packets. Runs FreeRTOS tasks to dynamically calculate real-time green signal extension timings based on incoming traffic volume.',
  },
  {
    id: 'signal_actuator',
    label: 'Signal Relay Actuator',
    sublabel: 'Dynamic Green Timing',
    x: 730,
    y: 130,
    width: 160,
    height: 70,
    description:
      'High-reliability solid-state relay array driving physical traffic signal heads based on adaptive mesh calculations, minimizing intersection queue wait times.',
  },
  {
    id: 'failsafe_engine',
    label: 'Autonomous Fail-Safe',
    sublabel: 'Fixed-Cycle Fallback',
    x: 380,
    y: 260,
    width: 190,
    height: 65,
    description:
      'Watchdog timer fail-safe daemon. If radio communication drops for > 3 consecutive cycles, nodes autonomously revert to standard fixed signal timing without human intervention.',
  },
];

const links: DiagramLink[] = [
  { from: 'junction_a', to: 'lora_gossip', label: 'Ad-Hoc Gossip' },
  { from: 'lora_gossip', to: 'junction_b', label: 'Queue Density' },
  { from: 'junction_b', to: 'signal_actuator', label: 'Relay Control' },
  { from: 'junction_a', to: 'failsafe_engine', label: 'Heartbeat', dashed: true },
  { from: 'failsafe_engine', to: 'signal_actuator', label: 'Safe Fallback', dashed: true },
];

export const LoRaDiagram: React.FC = () => {
  return (
    <Diagram
      title="Adaptive LoRa Mesh & Fail-Safe Architecture"
      nodes={nodes}
      links={links}
      width={930}
      height={360}
    />
  );
};
